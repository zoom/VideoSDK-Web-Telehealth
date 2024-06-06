import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding ...')
  try {
    const alice = await prisma.user.create({
      data: {
        email: 'alice@test.com',
        name: 'Alice',
        role: 'patient',
      },
    });
    await prisma.patient.create({
      data: {
        userId: alice.id,
        height: 170,
        weight: 60,
        bloodType: 'A+',
        allergies: 'Peanuts',
        medications: 'None',
        DOB: new Date('2000-01-01'),
        id: alice.id,
        User: {
          connect: { id: alice.id }
        }
      },
    });
    const bob = await prisma.user.create({
      data: {
        email: 'bob@test.com',
        name: 'Bob',
        role: 'doctor',
      },
    })
    await prisma.doctor.create({
      data: {
        userId: bob.id,
        position: 'General Practitioner',
        department: 'General Medicine',
        id: bob.id,
        User: {
          connect: { id: bob.id }
        }
      },
    });
    console.log('Seeding finished.')
    console.log({ alice, bob })
  } catch (e) {
    console.log('error')
    console.error(e)
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })