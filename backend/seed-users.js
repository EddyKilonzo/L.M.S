const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const users = [
  {
    email: 'admin@test.com',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
  },
  {
    email: 'instructor1@test.com',
    password: 'password123',
    firstName: 'Instructor',
    lastName: 'One',
    role: 'INSTRUCTOR',
  },
  {
    email: 'instructor2@test.com',
    password: 'password123',
    firstName: 'Instructor',
    lastName: 'Two',
    role: 'INSTRUCTOR',
  },
  {
    email: 'student@test.com',
    password: 'password123',
    firstName: 'Student',
    lastName: 'User',
    role: 'STUDENT',
  },
];

async function main() {
  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({
        data: {
          email: user.email,
          password: hashedPassword,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: true,
        },
      });
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 