'use server';
// import { prisma } from '@/db/'
import { PrismaClient } from "@prisma/client";
import { LATEST_STUDIES_LIMIT } from "../constants";

// Get latest study
export async function getLatestStudies() {
    const prisma = new PrismaClient();
    const data = await prisma.study.findMany({
        take: LATEST_STUDIES_LIMIT,
        orderBy: { createdAt: 'desc' }
    })
    
    return data
}