import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import {
  UpdateSeatingMapDto,
  CreateTableDto,
  UpdateTableDto,
  BulkCreateTablesDto,
  ImportDetectedTablesDto,
  AdminAssignTableMembersDto,
} from './dto/admin-seating.dto';
import { TableStatus, FilePurpose, FileAssetStatus, Prisma } from '@prisma/client';

@Injectable()
export class AdminSeatingService {
  private readonly logger = new Logger(AdminSeatingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // Seating Map
  async getSeatingMap(eventId: string) {
    let seatingMap = await this.prisma.seatingMap.findUnique({
      where: { event_id: eventId },
      include: { background_file: true },
    });

    if (!seatingMap) {
      seatingMap = await this.prisma.seatingMap.create({
        data: {
          event_id: eventId,
          background_original_width: 1000,
          background_original_height: 800,
        },
        include: { background_file: true },
      });
    }

    return seatingMap;
  }

  async updateSeatingMap(eventId: string, dto: UpdateSeatingMapDto) {
    await this.getSeatingMap(eventId);

    return this.prisma.seatingMap.update({
      where: { event_id: eventId },
      data: {
        background_original_width: dto.width !== undefined ? Math.round(dto.width) : undefined,
        background_original_height: dto.height !== undefined ? Math.round(dto.height) : undefined,
      },
      include: { background_file: true },
    });
  }

  async uploadBackground(eventId: string, storagePath: string, actorId?: string) {
    const asset = await this.prisma.fileAsset.create({
      data: {
        purpose: FilePurpose.SEATING_BACKGROUND,
        storage_path: storagePath,
        original_filename: storagePath.split('/').pop() || 'background.png',
        mime_type: 'image/png',
        size_bytes: 1024,
        status: FileAssetStatus.AVAILABLE,
        created_by_account_id: actorId,
      },
    });

    const updated = await this.prisma.seatingMap.upsert({
      where: { event_id: eventId },
      create: {
        event_id: eventId,
        background_original_width: 1000,
        background_original_height: 800,
        background_file_id: asset.id,
      },
      update: {
        background_file_id: asset.id,
      },
      include: { background_file: true },
    });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'seating_map.background_uploaded',
      resourceType: 'SeatingMap',
      resourceId: updated.id,
    });

    return updated;
  }

  async deleteBackground(eventId: string, actorId?: string) {
    const updated = await this.prisma.seatingMap.update({
      where: { event_id: eventId },
      data: { background_file_id: null },
      include: { background_file: true },
    });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'seating_map.background_deleted',
      resourceType: 'SeatingMap',
      resourceId: updated.id,
    });

    return updated;
  }

  // Tables CRUD
  async listTables(eventId: string) {
    const tables = await this.prisma.eventTable.findMany({
      where: { event_id: eventId },
      include: {
        assignments: {
          include: {
            group_member: {
              include: { membership: { include: { account: true } } },
            },
          },
        },
      },
      orderBy: { label: 'asc' },
    });

    return tables.map((t) => ({
      id: t.id,
      label: t.label,
      capacity: t.capacity,
      shape: t.shape,
      position_x: Number(t.position_x),
      position_y: Number(t.position_y),
      width: Number(t.width),
      height: Number(t.height),
      status: t.status,
      occupiedSeats: t.assignments.length,
      availableSeats: Math.max(0, t.capacity - t.assignments.length),
      assignments: t.assignments.map((a) => ({
        assignmentId: a.id,
        memberId: a.group_member_id,
        memberName: a.group_member.full_name,
        graduateName: a.group_member.membership.account.full_name,
        graduateEmail: a.group_member.membership.account.email,
        assignedAt: a.assigned_at,
      })),
    }));
  }

  async createTable(eventId: string, dto: CreateTableDto) {
    const existing = await this.prisma.eventTable.findUnique({
      where: {
        event_id_label: { event_id: eventId, label: dto.label.trim() },
      },
    });

    if (existing) {
      throw new ConflictException({
        code: 'TABLE_LABEL_EXISTS',
        message: `Ya existe una mesa con la etiqueta '${dto.label}'.`,
      });
    }

    return this.prisma.eventTable.create({
      data: {
        event_id: eventId,
        label: dto.label.trim(),
        capacity: dto.capacity,
        shape: dto.shape,
        position_x: new Prisma.Decimal(dto.position_x),
        position_y: new Prisma.Decimal(dto.position_y),
        width: new Prisma.Decimal(0.08),
        height: new Prisma.Decimal(0.08),
        status: TableStatus.AVAILABLE,
      },
    });
  }

  async bulkCreateTables(eventId: string, dto: BulkCreateTablesDto) {
    return this.prisma.$transaction(async (tx) => {
      const created = [];
      for (const tableData of dto.tables) {
        const item = await tx.eventTable.create({
          data: {
            event_id: eventId,
            label: tableData.label.trim(),
            capacity: tableData.capacity,
            shape: tableData.shape,
            position_x: new Prisma.Decimal(tableData.position_x),
            position_y: new Prisma.Decimal(tableData.position_y),
            width: new Prisma.Decimal(0.08),
            height: new Prisma.Decimal(0.08),
            status: TableStatus.AVAILABLE,
          },
        });
        created.push(item);
      }
      return created;
    });
  }

  async importDetectedTables(
    eventId: string,
    dto: ImportDetectedTablesDto,
    actorId?: string,
  ) {
    if (!dto.tables || dto.tables.length === 0) {
      throw new BadRequestException({
        code: 'NO_TABLES_PROVIDED',
        message: 'No se proporcionaron mesas para importar.',
      });
    }

    for (const table of dto.tables) {
      if (table.position_x < 0 || table.position_x > 1 || table.position_y < 0 || table.position_y > 1) {
        throw new BadRequestException({
          code: 'INVALID_GEOMETRY',
          message: `Coordenadas inválidas para la mesa '${table.label}'. Deben ser normalizadas entre 0 y 1.`,
        });
      }
    }

    const labelsSet = new Set<string>();
    for (const t of dto.tables) {
      const normalizedLabel = t.label.trim().toUpperCase();
      if (labelsSet.has(normalizedLabel)) {
        throw new BadRequestException({
          code: 'DUPLICATE_IMPORT_LABEL',
          message: `Etiqueta duplicada en el lote de importación: '${t.label}'.`,
        });
      }
      labelsSet.add(normalizedLabel);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      if (dto.replace_existing) {
        const assignmentsCount = await tx.tableAssignment.count({
          where: { table: { event_id: eventId } },
        });

        if (assignmentsCount > 0) {
          throw new ConflictException({
            code: 'CANNOT_REPLACE_TABLES_WITH_ASSIGNMENTS',
            message: 'No es posible reemplazar las mesas existentes porque ya cuentan con lugares asignados.',
          });
        }

        await tx.eventTable.deleteMany({
          where: { event_id: eventId },
        });
      } else {
        const existingTables = await tx.eventTable.findMany({
          where: { event_id: eventId },
          select: { label: true },
        });

        const existingSet = new Set(existingTables.map((t) => t.label.trim().toUpperCase()));
        for (const t of dto.tables) {
          if (existingSet.has(t.label.trim().toUpperCase())) {
            throw new ConflictException({
              code: 'TABLE_LABEL_COLLISION',
              message: `La mesa '${t.label}' ya existe en el evento. Usa replace_existing si deseas sobrescribir.`,
            });
          }
        }
      }

      const createdTables = [];
      for (const t of dto.tables) {
        const created = await tx.eventTable.create({
          data: {
            event_id: eventId,
            label: t.label.trim(),
            capacity: t.capacity,
            shape: t.shape,
            position_x: new Prisma.Decimal(t.position_x),
            position_y: new Prisma.Decimal(t.position_y),
            width: new Prisma.Decimal(0.08),
            height: new Prisma.Decimal(0.08),
            status: TableStatus.AVAILABLE,
          },
        });
        createdTables.push(created);
      }

      return createdTables;
    });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'tables.imported_from_detection',
      resourceType: 'EventTable',
      description: `Se importaron ${result.length} mesas detectadas automáticamente`,
    });

    return {
      success: true,
      importedCount: result.length,
      tables: result,
    };
  }

  async getTable(eventId: string, tableId: string) {
    const table = await this.prisma.eventTable.findFirst({
      where: { id: tableId, event_id: eventId },
      include: {
        assignments: {
          include: {
            group_member: {
              include: { membership: { include: { account: true } } },
            },
          },
        },
      },
    });

    if (!table) {
      throw new NotFoundException({
        code: 'TABLE_NOT_FOUND',
        message: 'Mesa no encontrada.',
      });
    }

    return table;
  }

  async updateTable(eventId: string, tableId: string, dto: UpdateTableDto) {
    await this.getTable(eventId, tableId);

    return this.prisma.eventTable.update({
      where: { id: tableId },
      data: {
        label: dto.label !== undefined ? dto.label.trim() : undefined,
        capacity: dto.capacity !== undefined ? dto.capacity : undefined,
        shape: dto.shape !== undefined ? dto.shape : undefined,
        position_x: dto.position_x !== undefined ? new Prisma.Decimal(dto.position_x) : undefined,
        position_y: dto.position_y !== undefined ? new Prisma.Decimal(dto.position_y) : undefined,
        status: dto.status !== undefined ? dto.status : undefined,
      },
    });
  }

  async deleteTable(eventId: string, tableId: string) {
    const table = await this.getTable(eventId, tableId);

    if (table.assignments.length > 0) {
      throw new ConflictException({
        code: 'TABLE_HAS_ASSIGNMENTS',
        message: 'No se puede eliminar una mesa con integrantes asignados.',
      });
    }

    await this.prisma.eventTable.delete({ where: { id: tableId } });
    return { success: true };
  }

  async blockTable(eventId: string, tableId: string, actorId?: string) {
    const table = await this.getTable(eventId, tableId);

    if (table.assignments.length > 0) {
      throw new ConflictException({
        code: 'CANNOT_BLOCK_OCCUPIED_TABLE',
        message: 'No se puede bloquear una mesa que ya cuenta con asignaciones.',
      });
    }

    const updated = await this.prisma.eventTable.update({
      where: { id: tableId },
      data: { status: TableStatus.BLOCKED },
    });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'table.blocked',
      resourceType: 'EventTable',
      resourceId: tableId,
      description: `Mesa ${table.label} bloqueada`,
    });

    return updated;
  }

  async unblockTable(eventId: string, tableId: string, actorId?: string) {
    const table = await this.getTable(eventId, tableId);

    const updated = await this.prisma.eventTable.update({
      where: { id: tableId },
      data: { status: TableStatus.AVAILABLE },
    });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'table.unblocked',
      resourceType: 'EventTable',
      resourceId: tableId,
      description: `Mesa ${table.label} desbloqueada`,
    });

    return updated;
  }

  async getTableAssignments(eventId: string, tableId: string) {
    const table = await this.getTable(eventId, tableId);
    return table.assignments;
  }

  async listEventTableAssignments(eventId: string) {
    return this.prisma.tableAssignment.findMany({
      where: { table: { event_id: eventId } },
      include: {
        table: true,
        group_member: {
          include: { membership: { include: { account: true } } },
        },
      },
      orderBy: { assigned_at: 'desc' },
    });
  }

  async adminAssignTableMembers(
    eventId: string,
    tableId: string,
    dto: AdminAssignTableMembersDto,
    actorId?: string,
  ) {
    const table = await this.getTable(eventId, tableId);

    if (table.status !== TableStatus.AVAILABLE) {
      throw new ConflictException({
        code: 'TABLE_NOT_AVAILABLE',
        message: 'La mesa seleccionada está bloqueada.',
      });
    }

    const currentCount = table.assignments.length;
    const newCount = dto.member_ids.length;
    if (currentCount + newCount > table.capacity) {
      throw new ConflictException({
        code: 'TABLE_CAPACITY_EXCEEDED',
        message: `Capacidad excedida. Capacidad: ${table.capacity}, ocupados: ${currentCount}, a asignar: ${newCount}.`,
      });
    }

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.tableAssignment.deleteMany({
        where: { group_member_id: { in: dto.member_ids } },
      });

      for (const memberId of dto.member_ids) {
        await tx.tableAssignment.create({
          data: {
            table_id: tableId,
            group_member_id: memberId,
          },
        });
      }

      return { assignedCount: dto.member_ids.length };
    });

    await this.auditService.log({
      eventId,
      actorAccountId: actorId,
      action: 'table.admin_assigned',
      resourceType: 'EventTable',
      resourceId: tableId,
      description: `Asignación administrativa de ${dto.member_ids.length} lugares a ${table.label}`,
    });

    return {
      success: true,
      tableId,
      assignedCount: result.assignedCount,
    };
  }
}
