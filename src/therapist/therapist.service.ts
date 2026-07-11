import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';


@Injectable()
export class TherapistService {
    constructor(private prisma: PrismaService) { }






}
