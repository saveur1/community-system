import dotenv from 'dotenv';
import db from '../models/index';
import sequelize, { initializeDatabase } from './database';

dotenv.config();

// Mock permissions
const permissions = [
  // User Permissions
  { name: 'user:create', description: 'Create users' },
  { name: 'user:view', description: 'View users' },
  { name: 'users:view', description: 'View All users'},
  { name: 'user:read', description: 'View users' },
  { name: 'user:update', description: 'Update users' },
  { name: 'user:delete', description: 'Delete users' },
  { name: 'role:create', description: 'Create roles' },
  { name: 'role:read', description: 'View roles' },
  { name: 'role:update', description: 'Update roles' },
  { name: 'role:delete', description: 'Delete roles' },

  // Feedback Permissions
  { name: 'feedback:create', description: 'Create feedback' },
  { name: 'feedback:read', description: 'View feedback' },
  { name: 'feedback:update', description: 'Update feedback' },
  { name: 'feedback:delete', description: 'Delete feedback' },
  { name: 'feedback:all:read', description: 'View all feedback' },
  { name: 'feedback:personal:read', description: 'View personal feedback' },
  { name: 'my_feedback:delete', description: 'Delete my feedback' },

  // Project Permissions
  { name: 'project:create', description: 'Create projects' },
  { name: 'project:read', description: 'View projects' },
  { name: 'project:update', description: 'Update projects' },
  { name: 'project:delete', description: 'Delete projects' },

  // Document Permissions
  { name: 'document:create', description: 'Create documents' },
  { name: 'document:read', description: 'View documents' },
  { name: 'document:update', description: 'Update documents' },
  { name: 'document:delete', description: 'Delete documents' },

  // Community Session Permissions
  { name: 'community_session:create', description: 'Create community sessions' },
  { name: 'community_session:read', description: 'View community sessions' },
  { name: 'community_session:update', description: 'Update community sessions' },
  { name: 'community_session:download', description: 'Download community sessions' },
  { name: 'community_session:delete', description: 'Delete community sessions' },

  // Comments Permissions
  { name: 'comment:create', description: 'Create comments' },
  { name: 'comment:read', description: 'View comments' },
  { name: 'comment:update', description: 'Update comments' },
  { name: 'comment:delete', description: 'Delete comments' },
  
  // Reporting Permissions
  { name: 'report:create', description: 'Create reports' },
  { name: 'report:read', description: 'View reports' },
  { name: 'report:update', description: 'Update reports' },
  { name: 'report:delete', description: 'Delete reports' },

  // dashboards Permissions
  { name: 'dashboard:analytics', description: 'View analytics dashboard' },
  { name: 'dashboard:stakeholder', description: 'View Stakeholders dashboard' },
  { name: 'dashboard:health', description: 'View health dashboard' },
  { name: 'dashboard:education', description: 'View education dashboard' },
  { name: 'dashboard:community', description: 'View community dashboard' },
  { name: 'dashboard:religious', description: 'View religious dashboard' },

  // Survey Permissions
  { name: 'survey:create', description: 'Create surveys' },
  { name: 'survey:read', description: 'View surveys' },
  { name: 'survey:respond', description: 'Respond to surveys' },
  { name: 'survey:update', description: 'Update surveys' },
  { name: 'survey:delete', description: 'Delete surveys' },
  { name: 'survey:analytics', description: 'View analytics' },
  { name: 'survey:forms', description: 'View and create other user\'s forms' },

  // Notification Permissions
  { name: 'notification:read', description: 'View notifications' },
  { name: 'notification:delete', description: 'Delete notifications' },

  // Announcement Permissions
  { name: 'announcement:create', description: 'Create announcements' },
  { name: 'announcement:read', description: 'View announcements' },
  { name: 'announcement:update', description: 'Update announcements' },
  { name: 'announcement:delete', description: 'Delete announcements' },

  //Rapid Enquiry Permissions
  { name: 'rapid_enquiry:create', description: 'Create rapid enquiry' },
  { name: 'rapid_enquiry:read', description: 'View rapid enquiry' },
  { name: 'rapid_enquiry:update', description: 'Update rapid enquiry' },
  { name: 'rapid_enquiry:delete', description: 'Delete rapid enquiry' }
];

// Base role templates with common permissions
const roleTemplates = { 
  // Stakeholders
  unicef: {
    description: 'UNICEF - Stakeholder role',
    category: 'Stakeholders',
    permissions: [
      'survey:read', 'survey:respond',
      'feedback:read',
      'feedback:personal:read',

      'document:read',
      'community_session:read', 'community_session:download',
      'report:create', 'report:read', 'report:update', 'report:delete', 'dashboard:stakeholder',
      'notification:read',
      'notification:delete',
      'announcement:read',
      'project:read',
      'comment:read',
      'comment:create',
      'comment:update'
    ]
  },
  rbc: {
    description: 'RBC - Stakeholder role',
    category: 'Stakeholders',
    permissions: [
      'survey:read', 'survey:respond',
      'feedback:read',
      'feedback:personal:read',
      'document:read',
      'community_session:read', 'community_session:download',
      'report:create', 'report:read', 'report:update', 'report:delete', 'dashboard:stakeholder',
      'notification:read',
      'notification:delete',
      'announcement:read',
      'project:read',
      'comment:read',
      'comment:create',
      'comment:update'
    ]
  },
  
  // Frontend-aligned roles from signup userTypes
  // Community Members
  volunteers: {
    description: 'Volunteers - Community role',
    category: 'Community Members',
    permissions: [
      //Surveys
      'survey:read', 'survey:respond',

      //Feedback
      'feedback:create', 'feedback:read', 'feedback:update','my_feedback:delete',
      'feedback:personal:read',

      //Documents
      'document:read','document:download','document:update','document:delete',

      //Reports
      'report:create', 'report:read', 'report:update',

      //Community Sessions
      'community_session:read','community_session:download',

      //Dashboard
      'dashboard:community',

      //Notifications
      'notification:read',
      'notification:delete',

      //Announcements
      'announcement:read',
      'announcement:delete',

      //Comments
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',

      //Projects
      'project:read'
    ]
  },
  youth_leaders: {
    description: 'Youth Leaders - Community role',
    category: 'Community Members',
    permissions: [
      //Surveys
      'survey:read', 'survey:respond',

      //Feedback
      'feedback:create', 'feedback:read', 'feedback:update','my_feedback:delete',
      'feedback:personal:read',

      //Documents
      'document:read','document:download','document:update','document:delete',

      //Reports
      'report:create', 'report:read', 'report:update',

      //Community Sessions
      'community_session:read','community_session:download',

      //Dashboard
      'dashboard:community',

      //Notifications
      'notification:read',
      'notification:delete',

      //Announcements
      'announcement:read',
      'announcement:delete',

      //Comments
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',

      //Projects
      'project:read'
    ]
  },
  local_government_leaders: {
    description: 'Local Government Leaders - Community role',
    category: 'Community Members',
    permissions: [
      //Surveys
      'survey:read', 'survey:respond',

      //Feedback
      'feedback:create', 'feedback:read', 'feedback:update','my_feedback:delete',
      'feedback:personal:read',

      //Documents
      'document:read','document:download','document:update','document:delete',

      //Reports
      'report:create', 'report:read', 'report:update',

      //Community Sessions
      'community_session:read','community_session:download',

      //Dashboard
      'dashboard:community',

      //Notifications
      'notification:read',
      'notification:delete',

      //Announcements
      'announcement:read',
      'announcement:delete',

      //Comments
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',

       //Projects
      'project:read'
    ]
  },
  school_representatives: {
    description: 'School Representatives - Community role',
    category: 'Community Members',
    permissions: [
      //Surveys
      'survey:read', 'survey:respond',

      //Feedback
      'feedback:create', 'feedback:read', 'feedback:update','my_feedback:delete',
      'feedback:personal:read',

      //Documents
      'document:read','document:download','document:update','document:delete',

      //Reports
      'report:create', 'report:read', 'report:update',

      //Community Sessions
      'community_session:read','community_session:download',

      //Dashboard
      'dashboard:community',

      //Notifications
      'notification:read',
      'notification:delete',

      //Announcements
      'announcement:read',
      'announcement:delete',

      //Comments
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',

       //Projects
      'project:read'
    ]
  },
  beneficiaries: {
    description: 'Beneficiaries - Community role',
    category: 'Community Members',
    permissions: [
      //Surveys
      'survey:read', 'survey:respond',

      //Feedback
      'feedback:create', 'feedback:read', 'feedback:update','my_feedback:delete',
      'feedback:personal:read',

      //Documents
      'document:read','document:download','document:update','document:delete',

      //Reports
      'report:create', 'report:read', 'report:update',

      //Community Sessions
      'community_session:read','community_session:download',

      //Dashboard
      'dashboard:community',

      //Notifications
      'notification:read',
      'notification:delete',

      //Announcements
      'announcement:read',
      'announcement:delete',

      //Comments
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',

       //Projects
      'project:read'
    ]
  },
  religious_community_representatives: {
    description: 'Religious Community Representatives - Community role',
    category: 'Community Members',
    permissions: [
      //Surveys
      'survey:read', 'survey:respond',

      //Feedback
      'feedback:create', 'feedback:read', 'feedback:update','my_feedback:delete',
      'feedback:personal:read',

      //Documents
      'document:read','document:download','document:update','document:delete',

      //Reports
      'report:create', 'report:read', 'report:update',

      //Community Sessions
      'community_session:read','community_session:download',

      //Dashboard
      'dashboard:community',

      //Notifications
      'notification:read',
      'notification:delete',

      //Announcements
      'announcement:read',
      'announcement:delete',

      //Comments
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',

       //Projects
      'project:read'
    ]
  },
  general_population: {
    description: 'General Population - Community role',
    category: 'Community Members',
    permissions: [
      //Surveys
      'survey:read', 'survey:respond',

      //Feedback
      'feedback:create', 'feedback:read', 'feedback:update','my_feedback:delete',
      'feedback:personal:read',

      //Documents
      'document:read','document:download','document:update','document:delete',

      //Community Sessions
      'community_session:read','community_session:download',

      //Dashboard
      'dashboard:community',

      //Notifications
      'notification:read',
      'notification:delete',

      //Announcements
      'announcement:read',
      'announcement:delete',

      //Comments
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',

       //Projects
      'project:read'
      ]
  },
  
  // Health service providers
  nurses: {
    description: 'Nurses - Health Services role',
    category: 'Health service providers',
    permissions: [
      //Surveys
      'survey:read', 'survey:respond','survey:create','survey:update','survey:delete',

      //Feedback
      'feedback:create', 'feedback:read', 'feedback:update','my_feedback:delete',
      'feedback:personal:read',

      //Documents
      'document:read','document:download','document:update','document:delete',

      //Reports
      'report:create', 'report:read', 'report:update',

      //Community Sessions
      'community_session:read','community_session:download',

      //Dashboard
      'dashboard:health',

      //Notifications
      'notification:read',
      'notification:delete',

      //Announcements
      'announcement:read',
      'announcement:delete',

      //Comments
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',

       //Projects
      'project:read'
      ]
  },
  chw: {
    description: 'Community Health Workers - Health Services role',
    category: 'Health service providers',
    permissions: [
      //Surveys
      'survey:read', 'survey:respond','survey:create','survey:update','survey:delete',

      //Feedback
      'feedback:create', 'feedback:read', 'feedback:update','my_feedback:delete',
      'feedback:personal:read',

      //Documents
      'document:read','document:download','document:update','document:delete',

      //Reports
      'report:create', 'report:read', 'report:update',

      //Community Sessions
      'community_session:read','community_session:download',

      //Dashboard
      'dashboard:health',

      //Notifications
      'notification:read',
      'notification:delete',

      //Announcements
      'announcement:read',
      'announcement:delete',

      //Comments
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',

       //Projects
      'project:read'
    ]
  },
  epi_managers: {
    description: 'EPI Managers - Health Services role',
    category: 'Health service providers',
    permissions: [
      //Surveys
      'survey:read', 'survey:respond','survey:create','survey:update','survey:delete',

      //Feedback
      'feedback:create', 'feedback:read', 'feedback:update','my_feedback:delete',
      'feedback:personal:read',

      //Documents
      'document:read','document:download','document:update','document:delete',

      //Reports
      'report:create', 'report:read', 'report:update',

      //Community Sessions
      'community_session:read','community_session:download',

      //Dashboard
      'dashboard:health',

      //Notifications
      'notification:read',
      'notification:delete',

      //Announcements
      'announcement:read',
      'announcement:delete',

      //Comments
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',

       //Projects
      'project:read'
    ]
  },
  doctors: {
    description: 'Doctors - Health Services role',
    category: 'Health service providers',
    permissions: [
      //Surveys
      'survey:read', 'survey:respond','survey:create','survey:update','survey:delete',

      //Feedback
      'feedback:create', 'feedback:read', 'feedback:update','my_feedback:delete',
      'feedback:personal:read',

      //Documents
      'document:read','document:download','document:update','document:delete',

      //Reports
      'report:create', 'report:read', 'report:update',

      //Community Sessions
      'community_session:read','community_session:download',

      //Dashboard
      'dashboard:health',

      //Notifications
      'notification:read',
      'notification:delete',

      //Announcements
      'announcement:read',
      'announcement:delete',

      //Comments
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',

       //Projects
      'project:read'
    ]
  },
  health_facility_managers: {
    description: 'Health Facility Managers - Health Services role',
    category: 'Health service providers',
    permissions: [
      //Surveys
      'survey:read', 'survey:respond','survey:create','survey:update','survey:delete',

      //Feedback
      'feedback:create', 'feedback:read', 'feedback:update','my_feedback:delete',
      'feedback:personal:read',

      //Documents
      'document:read','document:download','document:update','document:delete',

      //Reports
      'report:create', 'report:read', 'report:update',

      //Community Sessions
      'community_session:read','community_session:download',

      //Dashboard
      'dashboard:health',

      //Notifications
      'notification:read',
      'notification:delete',

      //Announcements
      'announcement:read',
      'announcement:delete',

      //Comments
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',

       //Projects
      'project:read'
    ]
  },
  anc: {
    description: 'ANC - Health Services role',
    category: 'Health service providers',
    permissions: [
      //Surveys
      'survey:read', 'survey:respond','survey:create','survey:update','survey:delete',

      //Feedback
      'feedback:create', 'feedback:read', 'feedback:update','my_feedback:delete',
      'feedback:personal:read',

      //Documents
      'document:read','document:download','document:update','document:delete',

      //Reports
      'report:create', 'report:read', 'report:update',

      //Community Sessions
      'community_session:read','community_session:download',

      //Dashboard
      'dashboard:health',

      //Notifications
      'notification:read',
      'notification:delete',

      //Announcements
      'announcement:read',
      'announcement:delete',

      //Comments
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',

       //Projects
      'project:read'
    ]
  },
  cho: {
    description: 'CHO - Health Services role',
    category: 'Health service providers',
    permissions: [
      //Surveys
      'survey:read', 'survey:respond','survey:create','survey:update','survey:delete',

      //Feedback
      'feedback:create', 'feedback:read', 'feedback:update','my_feedback:delete',
      'feedback:personal:read',

      //Documents
      'document:read','document:download','document:update','document:delete',

      //Reports
      'report:create', 'report:read', 'report:update',

      //Community Sessions
      'community_session:read','community_session:download',

      //Dashboard
      'dashboard:health',

      //Notifications
      'notification:read',
      'notification:delete',

      //Announcements
      'announcement:read',
      'announcement:delete',

      //Comments
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',

       //Projects
      'project:read'
    ]
  },
  frontline_health_workers: {
    description: 'Frontline Health Workers - Health Services role',
    category: 'Health service providers',
    permissions: [
      //Surveys
      'survey:read', 'survey:respond','survey:create','survey:update','survey:delete',

      //Feedback
      'feedback:create', 'feedback:read', 'feedback:update','my_feedback:delete',
      'feedback:personal:read',

      //Documents
      'document:read','document:download','document:update','document:delete',

      //Reports
      'report:create', 'report:read', 'report:update',

      //Community Sessions
      'community_session:read','community_session:download',

      //Dashboard
      'dashboard:health',

      //Notifications
      'notification:read',
      'notification:delete',

      //Announcements
      'announcement:read',
      'announcement:delete',

      //Comments
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',

       //Projects
      'project:read'
    ]
  },
  
  // RICH Members
  religious_leaders: {
    description: 'Religious Leaders - RICH Members role',
    category: 'RICH Members',
    permissions: [
      'survey:read', 'survey:respond', 'survey:create', 'survey:update','survey:forms',
      'feedback:create', 'feedback:read','feedback:all:read',
      'document:read',
      'community_session:read', 'community_session:create', 'community_session:download',
      'dashboard:religious',
      'notification:read',
      'announcement:read',
      'service:rating',
      'project:read',
      'comment:read',
      'comment:create',
      'comment:update',
      'rapid_enquiry:create',
      'rapid_enquiry:read',
      'rapid_enquiry:update',
      'rapid_enquiry:delete',

      //Projects
      'project:read'
    ]
  },
  rich_members_representatives: {
    description: 'RICH Members Representatives - RICH Members role',
    category: 'RICH Members',
    permissions: [
      'survey:read', 'survey:respond', 'survey:create', 'survey:update','survey:forms',
      'feedback:create', 'feedback:read','feedback:all:read',
      'document:read',
      'community_session:read', 'community_session:create',
      'dashboard:religious',
      'notification:read',
      'announcement:read',
      'service:rating',
      'project:read',
      'comment:read',
      'comment:create',
      'comment:update',
      'rapid_enquiry:create',
      'rapid_enquiry:read',
      'rapid_enquiry:update',
      'rapid_enquiry:delete',

       //Projects
      'project:read'
    ]
  },
  
  // System roles
  super_admin: {
    description: 'Has all permissions',
    category: 'System',
    permissions: permissions.map(p => p.name)
  },
  admin: {
    description: 'System administrator with most permissions',
    category: 'System',
    permissions: [
      'user:create', 'user:read', 'user:update', 'user:delete','user:view','users:view',
      'role:create', 'role:read', 'role:update', 'role:delete',
      'feedback:create', 'feedback:read', 'feedback:update', 'feedback:delete','feedback:all:read',
      'project:create', 'project:read', 'project:update', 'project:delete',
      'document:create', 'document:read', 'document:update', 'document:delete',
      'stakeholder:create', 'stakeholder:read', 'stakeholder:update', 'stakeholder:delete',
      'employee:create', 'employee:read', 'employee:update', 'employee:delete',
      'community_session:create', 'community_session:read', 'community_session:update', 'community_session:download', 'community_session:delete',
      'report:create', 'report:read', 'report:update', 'report:delete', 'dashboard:analytics',
      'survey:create', 'survey:read', 'survey:respond', 'survey:update', 'survey:delete', 'survey:forms',
      'notification:read',
      'notification:delete',
      'announcement:read',
      'service:rating',
      'comment:read',
      'comment:create',
      'comment:update',
      'comment:delete',
      'rapid_enquiry:create',
      'rapid_enquiry:read',
      'rapid_enquiry:update',
      'rapid_enquiry:delete',

      //Projects
      'project:read'
    ]
  }
};

// Create roles array from templates
const roles = Object.entries(roleTemplates).map(([name, role]) => ({
  name,
  ...role
}));

// Function to set up system permissions and roles
const setupSystem = async () => {
  try {
    // Test the database connection first
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Disable foreign key checks temporarily to allow dropping tables in any order
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    console.log('🔄 Dropping existing tables...');
    try {
      // Drop tables in reverse order of dependencies
      await sequelize.getQueryInterface().dropAllTables();
      console.log('✅ Dropped all tables');
    } catch (error) {
      console.log('ℹ️ All tables did not exist or could not be dropped');
    }
    try {
      // Drop tables in reverse order of dependencies
      await sequelize.getQueryInterface().dropTable('user_roles');
      console.log('✅ Dropped user_roles table');
    } catch (error) {
      console.log('ℹ️ user_roles table did not exist or could not be dropped');
    }
    
    try {
      await sequelize.getQueryInterface().dropTable('role_permissions');
      console.log('✅ Dropped role_permissions table');
    } catch (error) {
      console.log('ℹ️ role_permissions table did not exist or could not be dropped');
    }
    
    try {
      await sequelize.getQueryInterface().dropTable('users');
      console.log('✅ Dropped users table');
    } catch (error) {
      console.log('ℹ️ users table did not exist or could not be dropped');
    }
    
    try {
      await sequelize.getQueryInterface().dropTable('roles');
      console.log('✅ Dropped roles table');
    } catch (error) {
      console.log('ℹ️ roles table did not exist or could not be dropped');
    }
    
    try {
      await sequelize.getQueryInterface().dropTable('permissions');
      console.log('✅ Dropped permissions table');
    } catch (error) {
      console.log('ℹ️ permissions table did not exist or could not be dropped');
    }
    
    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('🔄 Creating database schema...');
    // Use force: true to ensure tables are recreated from scratch
    await sequelize.sync({ force: true });
    await initializeDatabase();
    console.log('✅ Database models synchronized.');

    // Create permissions - now we can safely query since tables exist
    console.log('🔄 Creating permissions...');
    const createdPermissions = [];
    
    for (const permission of permissions) {
      try {
        // Since we used force: true, tables are empty, so we can directly create
        const newPermission = await db.Permission.create({
          name: String(permission.name).trim(),
          description: permission.description
        });
        
        console.log(`✅ Created permission: ${newPermission.name}`);
        createdPermissions.push(newPermission);
      } catch (error) {
        console.error(`❌ Error creating permission ${permission.name}:`, error);
        throw error;
      }
    }
    console.log(`${createdPermissions.length} permissions created.`);

    // Create roles and associate permissions
    console.log('🔄 Creating roles and associating permissions...');
    const createdRoles = [];
    
    for (const roleData of roles) {
      try {
        // Create new role (tables are empty due to force: true)
        const role = await db.Role.create({
          name: String(roleData.name).trim(),
          description: roleData.description,
          category: (roleData as any).category ?? null,
        });
        console.log(`✅ Created role: ${role.name}`);

        // Get permission instances for this role
        const rolePermissions = await db.Permission.findAll({
          where: { name: roleData.permissions }
        });

        if (rolePermissions.length > 0) {
          // Use setPermissions to associate all permissions at once
          // This is more efficient than adding one by one
          await (role as any).setPermissions(rolePermissions);
          console.log(`🔗 Associated ${rolePermissions.length} permissions with role ${role.name}`);
        } else {
          console.warn(`⚠️  No permissions found for role: ${role.name}`);
        }
        
        createdRoles.push(role);
      } catch (error) {
        console.error(`❌ Error processing role ${roleData.name}:`, error);
        throw error;
      }
    }
    console.log(`${createdRoles.length} roles created with permissions.`);

    console.log('✅ System setup completed successfully!');
    return {
      roles: createdRoles.length,
      permissions: createdPermissions.length
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Alternative setup function that preserves existing data
const setupSystemPreserveData = async () => {
  try {
    // Test the database connection first
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    console.log('🔄 Creating/updating database schema...');
    // Use alter: true to modify existing tables without dropping data
    await sequelize.sync({ alter: true });
    await initializeDatabase();
    console.log('✅ Database models synchronized.');

    // Create permissions one by one, checking for existence
    console.log('🔄 Creating permissions...');
    const createdPermissions = [];
    
    for (const permission of permissions) {
      try {
        // Use findOrCreate to avoid duplicates
        const [newPermission, created] = await db.Permission.findOrCreate({
          where: { name: permission.name },
          defaults: {
            name: String(permission.name).trim(),
            description: permission.description
          }
        });
        
        if (created) {
          console.log(`✅ Created permission: ${newPermission.name}`);
        } else {
          console.log(`ℹ️  Permission already exists: ${newPermission.name}`);
        }
        createdPermissions.push(newPermission);
      } catch (error) {
        console.error(`❌ Error creating permission ${permission.name}:`, error);
        throw error;
      }
    }
    console.log(`${createdPermissions.length} permissions processed.`);

    // Create roles and associate permissions
    console.log('🔄 Creating roles and associating permissions...');
    const createdRoles = [];
    
    for (const roleData of roles) {
      try {
        // Use findOrCreate to avoid duplicates
        const [role, created] = await db.Role.findOrCreate({
          where: { name: roleData.name },
          defaults: {
            name: roleData.name.trim(),
            description: roleData.description,
            category: (roleData as any).category ?? null,
          }
        });

        if (created) {
          console.log(`✅ Created role: ${role.name}`);
        } else {
          console.log(`ℹ️  Role already exists: ${role.name}`);
        }

        // Get permission instances for this role
        const rolePermissions = await db.Permission.findAll({
          where: { name: roleData.permissions }
        });

        if (rolePermissions.length > 0) {
          // Use setPermissions to replace all existing associations efficiently
          // This will remove old permissions and set new ones in one operation
          await (role as any).setPermissions(rolePermissions);
          console.log(`🔗 Associated ${rolePermissions.length} permissions with role ${role.name}`);
        } else {
          console.warn(`⚠️  No permissions found for role: ${role.name}`);
        }
        
        createdRoles.push(role);
      } catch (error) {
        console.error(`❌ Error processing role ${roleData.name}:`, error);
        throw error;
      }
    }
    console.log(`${createdRoles.length} roles processed with permissions.`);

    console.log('✅ System setup completed successfully!');
    return {
      roles: createdRoles.length,
      permissions: createdPermissions.length
    };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run the setup if this file is executed directly
// Choose which setup function to use based on your needs
const runSetup = process.env.PRESERVE_DATA === 'true' ? setupSystemPreserveData : setupSystem;

runSetup()
    .then((result) => {
      console.log('✅ System setup completed successfully!', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error during system setup:', error);
      process.exit(1);
    });

export { setupSystem, setupSystemPreserveData };