import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, AddGuestsDto } from './dto/ticket.dto';
import { UpdateGuestDto } from './dto/guest.dto';

@Injectable()
export class GraduatesService {
    constructor(private prisma: PrismaService) { }

    async getProfile(graduateId: string) {
        const graduate = await this.prisma.graduate.findUnique({
            where: { id: graduateId },
            select: {
                id: true,
                event_id: true,
                full_name: true,
                email: true,
                phone: true,
                career: true,
                generation: true,
                group: true,
                status: true,
                tickets_step: true,
                layout_step: true,
                meals_step: true,
                payments_step: true,
                thermo_step: true,
                created_at: true,
            },
        });

        return {
            ...graduate,
            progress: {
                tickets_step: graduate.tickets_step,
                layout_step: graduate.layout_step,
                meals_step: graduate.meals_step,
                payments_step: graduate.payments_step,
                thermo_step: graduate.thermo_step,
            },
        };
    }

    async getDashboard(graduateId: string) {
        const graduate = await this.prisma.graduate.findUnique({
            where: { id: graduateId },
            include: {
                event: true,
                payments: {
                    where: { status: 'paid' },
                },
                tickets: true,
            },
        });

        if (!graduate) {
            return null;
        }

        // Calculate payment progress
        const totalPaid = graduate.payments.reduce(
            (sum, payment) => sum + Number(payment.amount),
            0,
        );

        const ticketInfo = graduate.tickets[0];
        const totalAmount = ticketInfo ? Number(ticketInfo.total_amount) : 0;
        const pendingAmount = totalAmount - totalPaid;
        const progressPercent = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

        // Determine thermo unlock status
        const thermoUnlocked = progressPercent >= graduate.event.thermo_threshold;

        return {
            graduate: {
                id: graduate.id,
                full_name: graduate.full_name,
                status: graduate.status,
            },
            event: {
                id: graduate.event.id,
                name: graduate.event.name,
                date: graduate.event.date,
                venue: graduate.event.venue,
            },
            steps: [
                { key: 'tickets', label: 'Boletos', status: graduate.tickets_step },
                { key: 'layout', label: 'Mesa', status: graduate.layout_step },
                { key: 'meals', label: 'Platillos', status: graduate.meals_step },
                { key: 'payments', label: 'Pagos', status: graduate.payments_step },
                { key: 'thermo', label: 'Termo', status: graduate.thermo_step },
                { key: 'summary', label: 'Resumen', status: 'available' },
            ],
            payment_progress: {
                total_amount: totalAmount,
                paid_amount: totalPaid,
                pending_amount: pendingAmount,
                progress_percent: progressPercent,
            },
            thermo: {
                unlocked: thermoUnlocked,
                required_percent: graduate.event.thermo_threshold,
                status: graduate.thermo_step,
            },
        };
    }

    // NEW: Create or update tickets
    async createTickets(graduateId: string, dto: CreateTicketDto) {
        const graduate = await this.prisma.graduate.findUnique({
            where: { id: graduateId },
            include: {
                event: true,
                tickets: true,
            },
        });

        if (!graduate) {
            throw new NotFoundException('Graduate not found');
        }

        // Check if tickets already exist
        if (graduate.tickets.length > 0) {
            throw new BadRequestException('Tickets already created. Use add guests to add more.');
        }

        const event = graduate.event;
        const basePrice = Number(event.ticket_price);
        const totalAmount = basePrice * dto.tickets_count;
        const initialPayment = Number(event.initial_payment);
        const remainingAmount = totalAmount - initialPayment;
        const monthlyPayment = Math.ceil(remainingAmount / event.months_duration);

        // Create ticket record
        await this.prisma.ticket.create({
            data: {
                graduate_id: graduateId,
                tickets_count: dto.tickets_count,
                base_price: basePrice,
                total_amount: totalAmount,
            },
        });

        // Create guest records (including the graduate)
        const guests = [];
        for (let i = 0; i < dto.tickets_count; i++) {
            const isGraduate = i === 0;
            guests.push({
                graduate_id: graduateId,
                type: isGraduate ? 'graduate' : 'guest',
                full_name: isGraduate ? graduate.full_name : `Invitado ${i}`,
                meal_type: 'traditional',
            });
        }

        await this.prisma.guest.createMany({
            data: guests,
        });

        // Update graduate progress
        await this.prisma.graduate.update({
            where: { id: graduateId },
            data: {
                tickets_step: 'completed',
                status: 'active',
            },
        });

        return {
            tickets_count: dto.tickets_count,
            base_price_per_ticket: basePrice,
            total_amount: totalAmount,
            payment_plan: {
                months: event.months_duration,
                initial_payment: initialPayment,
                monthly_payment: monthlyPayment,
            },
        };
    }

    // NEW: Get guests list
    async getGuests(graduateId: string) {
        const graduate = await this.prisma.graduate.findUnique({
            where: { id: graduateId },
            include: {
                tickets: true,
                guests: {
                    orderBy: {
                        created_at: 'asc',
                    },
                },
            },
        });

        if (!graduate) {
            throw new NotFoundException('Graduate not found');
        }

        const ticketsCount = graduate.tickets[0]?.tickets_count || 0;

        return {
            tickets_count: ticketsCount,
            guests: graduate.guests.map((guest) => ({
                id: guest.id,
                type: guest.type,
                full_name: guest.full_name,
                seat_number: guest.seat_number,
                meal_type: guest.meal_type,
            })),
        };
    }

    // NEW: Add additional guests
    async addGuests(graduateId: string, dto: AddGuestsDto) {
        const graduate = await this.prisma.graduate.findUnique({
            where: { id: graduateId },
            include: {
                event: true,
                tickets: true,
                guests: true,
                payments: {
                    where: { status: 'paid' },
                },
            },
        });

        if (!graduate) {
            throw new NotFoundException('Graduate not found');
        }

        if (graduate.tickets.length === 0) {
            throw new BadRequestException('No tickets found. Create tickets first.');
        }

        const currentTicket = graduate.tickets[0];
        const event = graduate.event;
        const basePrice = Number(event.ticket_price);

        // Calculate retroactives
        const paidPayments = graduate.payments.length;
        const retroactiveMonths = paidPayments;
        const pricePerMonth = basePrice / event.months_duration;
        const retroactivePerGuest = Math.ceil(pricePerMonth * retroactiveMonths);
        const totalRetroactive = retroactivePerGuest * dto.additional_guests;

        // Calculate new totals
        const newTicketsCount = currentTicket.tickets_count + dto.additional_guests;
        const extraTotalAmount = basePrice * dto.additional_guests;
        const updatedTotalAmount = Number(currentTicket.total_amount) + extraTotalAmount;

        // Calculate new monthly payment
        const totalPaid = graduate.payments.reduce(
            (sum, payment) => sum + Number(payment.amount),
            0,
        );
        const remainingAmount = updatedTotalAmount - totalPaid;
        const remainingMonths = event.months_duration - paidPayments;
        const updatedMonthlyPayment = remainingMonths > 0
            ? Math.ceil(remainingAmount / remainingMonths)
            : 0;

        // Update ticket record
        await this.prisma.ticket.update({
            where: { id: currentTicket.id },
            data: {
                tickets_count: newTicketsCount,
                total_amount: updatedTotalAmount,
            },
        });

        // Create new guest records
        const newGuests = [];
        const currentGuestCount = graduate.guests.length;
        for (let i = 0; i < dto.additional_guests; i++) {
            newGuests.push({
                graduate_id: graduateId,
                type: 'guest',
                full_name: `Invitado ${currentGuestCount + i}`,
                meal_type: 'traditional',
            });
        }

        await this.prisma.guest.createMany({
            data: newGuests,
        });

        // Create retroactive payment record if needed
        if (totalRetroactive > 0) {
            await this.prisma.payment.create({
                data: {
                    graduate_id: graduateId,
                    amount: totalRetroactive,
                    type: 'retroactive',
                    status: 'pending',
                },
            });
        }

        return {
            added_guests_count: dto.additional_guests,
            financial_impact: {
                new_tickets_count: dto.additional_guests,
                extra_total_amount: extraTotalAmount,
                retroactive_months: retroactiveMonths,
                retroactive_amount: totalRetroactive,
                updated_total_amount: updatedTotalAmount,
                updated_monthly_payment: updatedMonthlyPayment,
            },
        };
    }

    // NEW: Update guest
    async updateGuest(graduateId: string, guestId: string, dto: UpdateGuestDto) {
        const guest = await this.prisma.guest.findFirst({
            where: {
                id: guestId,
                graduate_id: graduateId,
            },
        });

        if (!guest) {
            throw new NotFoundException('Guest not found');
        }

        const updatedGuest = await this.prisma.guest.update({
            where: { id: guestId },
            data: dto,
        });

        return {
            id: updatedGuest.id,
            full_name: updatedGuest.full_name,
            meal_type: updatedGuest.meal_type,
        };
    }

    async getMeals(graduateId: string) {
        const graduate = await this.prisma.graduate.findUnique({
            where: { id: graduateId },
            include: {
                event: true,
                guests: {
                    orderBy: {
                        created_at: 'asc',
                    },
                },
            },
        });

        if (!graduate) {
            throw new NotFoundException('Graduate not found');
        }

        // Check if deadline has passed
        const now = new Date();
        const deadline = new Date(graduate.event.meals_deadline);
        const isDeadlinePassed = now > deadline;

        // Count meals
        const mealCounts = graduate.guests.reduce(
            (acc, guest) => {
                if (guest.meal_type === 'traditional') {
                    acc.traditional++;
                } else if (guest.meal_type === 'vegan') {
                    acc.vegan++;
                }
                return acc;
            },
            { traditional: 0, vegan: 0 },
        );

        return {
            guests: graduate.guests.map((guest) => ({
                id: guest.id,
                full_name: guest.full_name,
                type: guest.type,
                meal_type: guest.meal_type,
            })),
            meal_counts: mealCounts,
            deadline: graduate.event.meals_deadline,
            is_deadline_passed: isDeadlinePassed,
            can_edit: !isDeadlinePassed,
        };
    }

    async updateMeal(graduateId: string, guestId: string, mealType: string) {
        // Verify guest belongs to graduate
        const guest = await this.prisma.guest.findFirst({
            where: {
                id: guestId,
                graduate_id: graduateId,
            },
            include: {
                graduate: {
                    include: {
                        event: true,
                    },
                },
            },
        });

        if (!guest) {
            throw new NotFoundException('Guest not found');
        }

        // Check deadline
        const now = new Date();
        const deadline = new Date(guest.graduate.event.meals_deadline);
        if (now > deadline) {
            throw new BadRequestException(
                'Deadline for meal selection has passed',
            );
        }

        // Update meal type
        const updatedGuest = await this.prisma.guest.update({
            where: { id: guestId },
            data: {
                meal_type: mealType,
            },
        });

        // Update graduate progress if not already completed
        if (guest.graduate.meals_step !== 'completed') {
            await this.prisma.graduate.update({
                where: { id: graduateId },
                data: {
                    meals_step: 'completed',
                },
            });
        }

        return {
            id: updatedGuest.id,
            full_name: updatedGuest.full_name,
            meal_type: updatedGuest.meal_type,
        };
    }

    async getThermoStatus(graduateId: string) {
        const graduate = await this.prisma.graduate.findUnique({
            where: { id: graduateId },
            include: {
                event: true,
                tickets: true,
                payments: {
                    where: { status: 'paid' },
                },
            },
        });

        if (!graduate) {
            throw new NotFoundException('Graduate not found');
        }

        // Calcular progreso de pago
        const totalAmount = Number(graduate.tickets[0]?.total_amount || 0);
        const totalPaid = graduate.payments.reduce(
            (sum, p) => sum + Number(p.amount),
            0,
        );
        const progressPercent =
            totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

        const isUnlocked = progressPercent >= graduate.event.thermo_threshold;
        const hasCustomized = graduate.thermo_step === 'completed';

        return {
            is_unlocked: isUnlocked,
            has_customized: hasCustomized,
            thermo_step: graduate.thermo_step,
            progress_percent: progressPercent,
            threshold: graduate.event.thermo_threshold,
            thermo_prefix: graduate.thermo_prefix,
            thermo_name: graduate.thermo_name,
        };
    }

    async customizeThermo(graduateId: string, prefix: string, name: string) {
        const graduate = await this.prisma.graduate.findUnique({
            where: { id: graduateId },
            include: {
                event: true,
                tickets: true,
                payments: {
                    where: { status: 'paid' },
                },
            },
        });

        if (!graduate) {
            throw new NotFoundException('Graduate not found');
        }

        // Verificar que el termo esté desbloqueado
        const totalAmount = Number(graduate.tickets[0]?.total_amount || 0);
        const totalPaid = graduate.payments.reduce(
            (sum, p) => sum + Number(p.amount),
            0,
        );
        const progressPercent =
            totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

        if (progressPercent < graduate.event.thermo_threshold) {
            throw new BadRequestException(
                `Thermo is locked. Reach ${graduate.event.thermo_threshold}% payment progress to unlock.`,
            );
        }

        // Validar longitud del nombre
        if (name.length > 14) {
            throw new BadRequestException('Name cannot exceed 14 characters');
        }

        // Actualizar termo
        const updatedGraduate = await this.prisma.graduate.update({
            where: { id: graduateId },
            data: {
                thermo_prefix: prefix,
                thermo_name: name,
                thermo_step: 'completed',
            },
        });

        return {
            thermo_prefix: updatedGraduate.thermo_prefix,
            thermo_name: updatedGraduate.thermo_name,
            full_text: prefix ? `${prefix} ${name}` : name,
        };
    }

    async resetTickets(graduateId: string) {
        const graduate = await this.prisma.graduate.findUnique({
            where: { id: graduateId },
        });

        if (!graduate) {
            throw new NotFoundException('Graduate not found');
        }

        // Delete all guests
        await this.prisma.guest.deleteMany({
            where: { graduate_id: graduateId },
        });

        // Delete all tickets
        await this.prisma.ticket.deleteMany({
            where: { graduate_id: graduateId },
        });

        // Reset graduate progress
        await this.prisma.graduate.update({
            where: { id: graduateId },
            data: {
                tickets_step: 'pending',
                layout_step: 'locked',
                meals_step: 'locked',
            },
        });

        return {
            message: 'Tickets reset successfully. You can now select tickets again.',
        };
    }
}

