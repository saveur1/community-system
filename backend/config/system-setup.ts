import dotenv from 'dotenv';
import db from '../models/index';
import sequelize, { initializeDatabase } from './database';

dotenv.config();

// Mock permissions
const permissions = [
  // User Permissions
  { name: 'user:create', description: 'Create users' },
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

  // Programme Permissions
  { name: 'programme:create', description: 'Create programmes' },
  { name: 'programme:read', description: 'View programmes' },
  { name: 'programme:update', description: 'Update programmes' },
  { name: 'programme:delete', description: 'Delete programmes' },

  // Document Permissions
  { name: 'document:create', description: 'Create documents' },
  { name: 'document:read', description: 'View documents' },
  { name: 'document:update', description: 'Update documents' },
  { name: 'document:delete', description: 'Delete documents' },

  // Stakeholder Permissions
  { name: 'stakeholder:create', description: 'Create stakeholders' },
  { name: 'stakeholder:read', description: 'View stakeholders' },
  { name: 'stakeholder:update', description: 'Update stakeholders' },
  { name: 'stakeholder:delete', description: 'Delete stakeholders' },

  // Employee Permissions
  { name: 'employee:create', description: 'Create employees' },
  { name: 'employee:read', description: 'View employees' },
  { name: 'employee:update', description: 'Update employees' },
  { name: 'employee:delete', description: 'Delete employees' },

  // Community Session Permissions
  { name: 'community_session:create', description: 'Create community sessions' },
  { name: 'community_session:read', description: 'View community sessions' },
  { name: 'community_session:update', description: 'Update community sessions' },
  { name: 'community_session:download', description: 'Download community sessions' },
  { name: 'community_session:delete', description: 'Delete community sessions' },
  
  // Reporting Permissions
  { name: 'reporting:dashboard', description: 'View reporting dashboard' },
  { name: 'reporting:export', description: 'Export reports' },
  { name: 'reporting:analytics', description: 'View analytics' },

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
  /*Just added*/{ name: 'survey:analytics', description: 'View analytics' },

  // Notification Permissions
  { name: 'notification:read', description: 'View notifications' },
  { name: 'notification:delete', description: 'Delete notifications' },

  // Announcement Permissions
  { name: 'announcement:create', description: 'Create announcements' },
  { name: 'announcement:read', description: 'View announcements' },
  { name: 'announcement:update', description: 'Update announcements' },
  { name: 'announcement:delete', description: 'Delete announcements' },

  // Services Rating Permissions
  { name: 'service:rating', description: 'View services rating' },

  // Immunization permissions
  { name: 'immunization:read', description: 'View immunizations' },
  { name: 'immunization:create', description: 'Create immunizations' },
  { name: 'immunization:update', description: 'Update immunizations' },
  { name: 'immunization:delete', description: 'Delete immunizations' },
  { name: 'immunization:report', description: 'View immunizations report' },
];

// Base role templates with common permissions
const roleTemplates = {
  // Community roles
  local_citizen: {
    description: 'Local Citizen - Community role',
    permissions: [
      'survey:read', 'survey:respond',
      'feedback:create', 'feedback:read', 'feedback:update', 'feedback:delete',
      'document:read',
      'community_session:read','community_session:download',
      'dashboard:community',
      'notification:read', 'notification:delete',
      'announcement:read',
      'service:rating',
    ]
  },
  health_worker: {
    description: 'Health Worker - Community role',
    permissions: [
      'survey:read', 'survey:respond', 'survey:create', 'survey:update','survey:delete','survey:analytics',
      'feedback:create', 'feedback:read',
      'document:read',
      'community_session:read', 'community_session:create',
      'dashboard:health',
      'notification:read',
      'notification:delete',
      'announcement:read',
      'service:rating',
      'immunization:read',
      'immunization:report',
    ]
  },
  local_influencer: {
    description: 'Local Influencer - Community role',
    permissions: [
      'survey:read', 'survey:respond', 'survey:create', 'survey:update',
      'feedback:create', 'feedback:read',
      'document:read',
      'community_session:read',
      'dashboard:community',
      'notification:read',
      'notification:delete',
      'announcement:read',
      'service:rating',
    ]
  },
  school_director: {
    description: 'School Director - Community role',
    permissions: [
      'survey:read', 'survey:respond', 'survey:create', 'survey:update',
      'feedback:create', 'feedback:read', 'feedback:update',
      'document:read', 'document:create',
      'community_session:read', 'community_session:create',
      'dashboard:education',
      'notification:read',
      'notification:delete',
      'announcement:read',
      'service:rating',
    ]
  },
  
  // Religious Leaders
  religious_influencer: {
    description: 'Religious Influencer - Religious Leaders role',
    permissions: [
      'survey:read', 'survey:respond', 'survey:create', 'survey:update',
      'feedback:create', 'feedback:read',
      'document:read',
      'community_session:read', 'community_session:create', 'community_session:download',
      'dashboard:religious',
      'notification:read',
      'notification:delete',
      'announcement:read',
      'service:rating',
    ]
  },
  pastor: {
    description: 'Pastor - Religious Leaders role',
    permissions: [
      'survey:read', 'survey:respond', 'survey:create', 'survey:update',
      'feedback:create', 'feedback:read', 'feedback:update',
      'document:read', 'document:create',
      'community_session:read', 'community_session:create', 'community_session:download',
      'dashboard:religious',
      'notification:read',
      'notification:delete',
      'announcement:read',
      'service:rating',
    ]
  },
  church_mosque_rep: {
    description: 'Church/Mosque Representative - Religious Leaders role',
    permissions: [
      'survey:read', 'survey:respond', 'survey:create', 'survey:update',
      'feedback:create', 'feedback:read',
      'document:read',
      'community_session:read', 'community_session:create', 'community_session:download',
      'dashboard:religious',
      'notification:read',
      'notification:delete',
      'announcement:read',
      'service:rating',
    ]
  },
  
  // Health Services Providers
  nurse: {
    description: 'Nurse - Health Services role',
    permissions: [
      'survey:read', 'survey:respond', 'survey:create', 'survey:update',
      'feedback:create', 'feedback:read', 'feedback:update',
      'document:read', 'document:create',
      'community_session:read', 'community_session:create', 'community_session:download',
      'reporting:dashboard', 'reporting:export', 'dashboard:health',
      'notification:read',
      'notification:delete',
      'announcement:read',
      'service:rating',
    ]
  },
  local_health_center: {
    description: 'Local Health Center - Health Services role',
    permissions: [
      'survey:read', 'survey:respond', 'survey:create', 'survey:update',
      'feedback:create', 'feedback:read', 'feedback:update',
      'document:read', 'document:create',
      'community_session:read', 'community_session:create', 'community_session:download',
      'reporting:dashboard', 'reporting:export', 'reporting:analytics', 'dashboard:health',
      'notification:read',
      'notification:delete',
      'announcement:read',
      'service:rating',
    ]
  },
  epi_supervisor: {
    description: 'EPI Supervisor - Health Services role',
    permissions: [
      'survey:read', 'survey:respond', 'survey:create', 'survey:update', 'survey:delete',
      'feedback:create', 'feedback:read', 'feedback:update',
      'document:read', 'document:create',
      'community_session:read', 'community_session:create', 'community_session:download',
      'reporting:dashboard', 'reporting:export', 'reporting:analytics', 'dashboard:health',
      'notification:read',
      'notification:delete',
      'announcement:read',
      'service:rating',
    ]
  },
  
  // Stakeholders
  unicef: {
    description: 'UNICEF - Stakeholder role',
    permissions: [
      'survey:read', 'survey:respond',
      'feedback:read',
      'document:read',
      'community_session:read', 'community_session:download',
      'reporting:dashboard', 'reporting:export', 'reporting:analytics', 'dashboard:stakeholder',
      'notification:read',
      'notification:delete',
      'announcement:read',
      'service:rating',
    ]
  },
  rbc: {
    description: 'RBC - Stakeholder role',
    permissions: [
      'survey:read', 'survey:respond',
      'feedback:read',
      'document:read',
      'community_session:read', 'community_session:download',
      'reporting:dashboard', 'reporting:export', 'reporting:analytics', 'dashboard:stakeholder',
      'notification:read',
      'notification:delete',
      'announcement:read',
      'service:rating',
    ]
  },
  
  // System roles
  super_admin: {
    description: 'Has all permissions',
    permissions: permissions.map(p => p.name)
  },
  admin: {
    description: 'System administrator with most permissions',
    permissions: [
      'user:create', 'user:read', 'user:update', 'user:delete',
      'role:create', 'role:read', 'role:update', 'role:delete',
      'feedback:create', 'feedback:read', 'feedback:update', 'feedback:delete',
      'programme:create', 'programme:read', 'programme:update', 'programme:delete',
      'document:create', 'document:read', 'document:update', 'document:delete',
      'stakeholder:create', 'stakeholder:read', 'stakeholder:update', 'stakeholder:delete',
      'employee:create', 'employee:read', 'employee:update', 'employee:delete',
      'community_session:create', 'community_session:read', 'community_session:update', 'community_session:download', 'community_session:delete',
      'reporting:dashboard', 'reporting:export', 'reporting:analytics',
      'dashboard:analytics',
      'survey:create', 'survey:read', 'survey:respond', 'survey:update', 'survey:delete',
      'notification:read',
      'notification:delete',
      'announcement:read',
      'service:rating',
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
          description: roleData.description
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
            description: roleData.description
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