require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Venture = require('./src/models/Venture');
const Wallet = require('./src/models/Wallet');
const Employee = require('./src/models/Employee');
const Project = require('./src/models/Project');
const Task = require('./src/models/Task');
const Transaction = require('./src/models/Transaction');
const Reward = require('./src/models/Reward');
const Notification = require('./src/models/Notification');
const ActivityLog = require('./src/models/ActivityLog');
const Settings = require('./src/models/Settings');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany(),
      Venture.deleteMany(),
      Wallet.deleteMany(),
      Employee.deleteMany(),
      Project.deleteMany(),
      Task.deleteMany(),
      Transaction.deleteMany(),
      Reward.deleteMany(),
      Notification.deleteMany(),
      ActivityLog.deleteMany(),
      Settings.deleteMany()
    ]);

    console.log('Creating Admin User...');
    const hashedPassword = await bcrypt.hash('Admin@1234', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@thenam.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+91 98765 43210',
      department: 'Management'
    });

    console.log('Creating Manager User...');
    const managerUser = await User.create({
      name: 'Isha Manager',
      email: 'isha@thenam.com',
      password: hashedPassword,
      role: 'MANAGER',
      phone: '+91 98765 43211',
      department: 'Operations'
    });

    console.log('Creating Employee User...');
    const employeeUser = await User.create({
      name: 'Neha Employee',
      email: 'neha@thenam.com',
      password: hashedPassword,
      role: 'EMPLOYEE',
      phone: '+91 98765 43212',
      department: 'Sales'
    });

    console.log('Creating Founder User...');
    const founderUser = await User.create({
      name: 'Aarav Founder',
      email: 'aarav@thenam.com',
      password: hashedPassword,
      role: 'FINANCE', // Assuming FOUNDER might be mapped to FINANCE or ADMIN, let's use ADMIN or a custom role if supported
      phone: '+91 98765 43213',
      department: 'Management'
    });

    console.log('Creating Settings...');
    await Settings.create({ singleton: true });

    console.log('Creating Ventures and Wallets...');
    const venturesData = [
      { name: 'PaperHeros', key: 'paperheros', tagline: 'Sustainable paper products', industry: 'Manufacturing', status: 'active', gradient: 'gradient-royal' },
      { name: 'PrintKada', key: 'printkada', tagline: 'On-demand custom printing', industry: 'Printing', status: 'active', gradient: 'gradient-emerald' },
      { name: 'Zaymazone', key: 'zaymazone', tagline: 'E-commerce platform', industry: 'Retail', status: 'active', gradient: 'gradient-gold' },
      { name: 'Thenam', key: 'thenam', tagline: 'Software Solutions', industry: 'Technology', status: 'active', gradient: 'gradient-brand' }
    ];

    const ventures = await Venture.insertMany(venturesData.map(v => ({ ...v, createdBy: adminUser._id })));
    
    // Wallets are created automatically by the Venture model if we used the service, 
    // but here we use insertMany which bypasses hooks. So we create wallets manually.
    const wallets = await Wallet.insertMany(ventures.map(v => ({
      venture: v._id,
      balance: Math.floor(Math.random() * 500000) + 100000,
      totalRevenue: Math.floor(Math.random() * 1000000) + 500000,
      totalExpense: Math.floor(Math.random() * 500000) + 100000
    })));

    console.log('Creating Employees...');
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Design'];
    const roles = ['Manager', 'Developer', 'Designer', 'Executive', 'Analyst'];
    
    const employeesData = Array.from({ length: 42 }).map((_, i) => ({
      name: `Employee ${i + 1}`,
      email: `employee${i + 1}@thenam.com`,
      department: departments[Math.floor(Math.random() * departments.length)],
      role: roles[Math.floor(Math.random() * roles.length)],
      venture: ventures[Math.floor(Math.random() * ventures.length)]._id,
      salary: Math.floor(Math.random() * 100000) + 30000,
      status: 'Active',
      rewardPoints: Math.floor(Math.random() * 500),
      createdBy: adminUser._id,
      performance: {
         rating: Math.floor(Math.random() * 30) + 70 // 70 to 100
      }
    }));
    const employees = await Employee.insertMany(employeesData);

    console.log('Creating Projects...');
    const projectsData = Array.from({ length: 24 }).map((_, i) => {
        const venture = ventures[Math.floor(Math.random() * ventures.length)];
        // find employees for this venture to assign
        const ventureEmps = employees.filter(e => e.venture.equals(venture._id));
        const manager = ventureEmps.length > 0 ? ventureEmps[0]._id : null;
        
        return {
          name: `Project Alpha ${i + 1}`,
          description: 'Strategic initiative for Q3',
          venture: venture._id,
          manager,
          status: ['Planning', 'Active', 'Completed'][Math.floor(Math.random() * 3)],
          budget: Math.floor(Math.random() * 50000) + 10000,
          createdBy: adminUser._id
        };
    });
    const projects = await Project.insertMany(projectsData);

    console.log('Creating Tasks...');
    const taskData = [];
    projects.forEach(project => {
        // Create 10 tasks per project
        const projectEmps = employees.filter(e => e.venture.equals(project.venture));
        
        for(let i=0; i<10; i++) {
            const assignee = projectEmps.length > 0 ? projectEmps[Math.floor(Math.random() * projectEmps.length)]._id : null;
            const statuses = ['Pending', 'In Progress', 'Review', 'Completed'];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            taskData.push({
                title: `Task ${i + 1} for ${project.name}`,
                project: project._id,
                venture: project.venture,
                assignedTo: assignee,
                assignedBy: adminUser._id,
                status: status,
                priority: ['Low', 'Medium', 'High', 'Critical'][Math.floor(Math.random() * 4)],
                progress: status === 'Completed' ? 100 : Math.floor(Math.random() * 80)
            });
        }
    });
    await Task.insertMany(taskData);

    console.log('Creating Transactions...');
    const txData = [];
    const now = new Date();
    
    for(let i=0; i<36; i++) {
        const venture = ventures[Math.floor(Math.random() * ventures.length)];
        const wallet = wallets.find(w => w.venture.equals(venture._id));
        const type = Math.random() > 0.4 ? 'Money In' : 'Money Out';
        const isMoneyIn = type === 'Money In';
        
        // Random date within last 6 months
        const date = new Date(now.getTime() - Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000));
        
        txData.push({
            referenceNumber: `TX-${20000 + i}`,
            type: type,
            amount: Math.floor(Math.random() * 10000) + 500,
            venture: venture._id,
            wallet: wallet._id,
            category: isMoneyIn ? 'Client Payment' : 'Operating Expense',
            date: date,
            createdBy: adminUser._id
        });
    }
    await Transaction.insertMany(txData);

    console.log('Creating Rewards, Notifications, Logs...');
    // A few rewards
    await Reward.insertMany(employees.slice(0, 14).map((e, i) => ({
        employee: e._id,
        title: `Outstanding Performer ${i+1}`,
        points: 50,
        createdBy: adminUser._id
    })));

    // A few notifications
    await Notification.insertMany(Array.from({length: 20}).map((_, i) => ({
        user: adminUser._id,
        title: `System Alert ${i+1}`,
        message: 'This is a seeded notification',
        type: 'general'
    })));

    // Activity Logs
    await ActivityLog.insertMany(Array.from({length: 30}).map((_, i) => ({
        user: adminUser._id,
        userName: 'Aarav Sharma',
        action: 'Seeded Data',
        entity: 'System'
    })));

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
