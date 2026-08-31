import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
      console.log('🌱 Starting database setup...');

      try {
            // Create admin user
            const hashedPassword = await bcrypt.hash('admin123', 12);

            const admin = await prisma.user.upsert({
                  where: { email: 'admin@rojgarai.com' },
                  update: {},
                  create: {
                        email: 'admin@rojgarai.com',
                        name: 'Admin User',
                        password: hashedPassword,
                        role: 'ADMIN'
                  }
            });

            console.log('✅ Admin user created:', admin.email);

            // Create sample user
            const userPassword = await bcrypt.hash('user123', 12);

            const user = await prisma.user.upsert({
                  where: { email: 'user@example.com' },
                  update: {},
                  create: {
                        email: 'user@example.com',
                        name: 'Sample User',
                        password: userPassword,
                        role: 'USER'
                  }
            });

            console.log('✅ Sample user created:', user.email);

            // Create sample jobs
            const jobs = [
                  {
                        title: 'Software Engineer',
                        type: 'PRIVATE',
                        organization: 'Google',
                        location: 'Bangalore, India',
                        qualification: 'B.Tech/M.Tech in Computer Science',
                        salary: '₹12-18 LPA',
                        lastDate: new Date('2024-12-31'),
                        description: 'Looking for experienced software engineers...',
                        applyLink: 'https://careers.google.com',
                        status: 'PUBLISHED',
                        createdBy: admin.id,
                        isFeatured: true
                  },
                  {
                        title: 'Bank Manager',
                        type: 'GOVERNMENT',
                        organization: 'State Bank of India',
                        location: 'New Delhi',
                        qualification: 'MBA/CA',
                        salary: '₹8-12 LPA',
                        lastDate: new Date('2024-11-30'),
                        description: 'Manager position at SBI...',
                        applyLink: 'https://sbi.co.in/careers',
                        status: 'PUBLISHED',
                        createdBy: admin.id,
                        isFeatured: true
                  },
                  {
                        title: 'Marketing Intern',
                        type: 'INTERNSHIP',
                        organization: 'Amazon',
                        location: 'Hyderabad',
                        qualification: 'Any Graduate',
                        salary: '₹25k/month',
                        lastDate: new Date('2024-10-15'),
                        description: '3-month marketing internship...',
                        applyLink: 'https://amazon.jobs',
                        status: 'PUBLISHED',
                        createdBy: admin.id
                  }
            ];

            for (const jobData of jobs) {
                  const job = await prisma.job.create({
                        data: jobData
                  });
                  console.log(`✅ Job created: ${job.title}`);
            }

            console.log('🎉 Database setup completed successfully!');
            console.log('\n📋 Login credentials:');
            console.log('Admin: admin@rojgarai.com / admin123');
            console.log('User: user@example.com / user123');

      } catch (error) {
            console.error('❌ Setup error:', error);
            process.exit(1);
      } finally {
            await prisma.$disconnect();
      }
}

main();