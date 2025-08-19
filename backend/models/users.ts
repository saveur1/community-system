import { DataTypes, Model, Transaction } from 'sequelize';
import sequelize from '../config/database';
import { IUserAttributes, IUserCreationAttributes, IUserInstance } from '../types/user-types';
import { Role } from './role';
import  UserRole  from './userRole';
import  Permission  from './permission';

// Define the User model
class User extends Model<IUserAttributes, IUserCreationAttributes> implements IUserInstance {
  // Use declare to prevent shadowing Sequelize's getters/setters
  declare id: string;
  declare name: string;
  declare email: string;
  declare password: string;
  declare address: string | null;
  declare phone: string | null;
  declare status: 'active' | 'inactive';
  declare resetPasswordCode: string | null;
  declare resetPasswordExpires: Date | null;
  declare googleId: string | null;
  declare salary: number | null;
  declare profile: string | null;
  declare emailVerified: boolean;
  declare verified: boolean;
  declare roles?: Role[];
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  
  // Sequelize association methods - these will be added automatically by Sequelize
  declare getRoles: (options?: any) => Promise<Role[]>;
  declare addRole: (role: Role | string, options?: any) => Promise<void>;
  declare removeRole: (role: Role | string, options?: any) => Promise<void>;
  declare setRoles: (roles: Role[] | string[], options?: any) => Promise<void>;
  declare addRoles: (roles: Role[] | string[], options?: any) => Promise<void>;
  
  public async hasRole(role: Role | string): Promise<boolean> {
    const roles = await this.getRoles();
    if (typeof role === 'string') {
      return roles.some(r => r.id === role || r.name === role);
    }
    return roles.some(r => r.id === role.id);
  }
  
  // Static associations
  public static associations: {
    roles: any;
  };

  // Instance methods to satisfy IUserInstance
  public async hasRoleByName(roleName: string): Promise<boolean> {
    const roles = await this.getRoles();
    return roles.some((role: any) => role.name === roleName);
  }

  public async hasPermission(permissionName: string): Promise<boolean> {
    const roles = await this.getRoles({
      include: [{
        model: Permission,
        as: 'permissions',
        through: { attributes: [] },
        required: false
      }]
    });
    
    return roles.some((role: any) => 
      role.permissions && role.permissions.some((permission: any) => permission.name === permissionName)
    );
  }

  public async addRoleById(roleId: string, transaction?: Transaction): Promise<void> {
    await UserRole.create({
      userId: this.id,
      roleId
    }, { transaction });
  }

  public async removeRoleById(roleId: string, transaction?: Transaction): Promise<void> {
    await UserRole.destroy({
      where: {
        userId: this.id,
        roleId
      },
      transaction
    });
  }

  // Add $get and $add methods to satisfy IUserInstance
  public $get(association: string, options?: any): Promise<any> {
    // @ts-ignore - This is a dynamic method provided by Sequelize
    return this[`get${association.charAt(0).toUpperCase() + association.slice(1)}`](options);
  }

  public $add(association: string, instance: any, options?: any): Promise<void> {
    // @ts-ignore - This is a dynamic method provided by Sequelize
    return this[`add${association.charAt(0).toUpperCase() + association.slice(1)}`](instance, options);
  }
}

// Initialize the model
User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
        },
        comment: "Name field is required."
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isNumeric: true,
        },
    },
    emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'email_verified',
        comment: 'Whether the user has verified their email address.'
    },
    verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether the user has been verified by an admin (required for non-local_influencer roles)'
    },
    status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resetPasswordCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    googleId: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    // New fields:
    salary: {
        type: DataTypes.FLOAT,
        allowNull: true,
        validate: {
            min: 0,
        },
    },
    profile: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
      isCustomUrl(value: string) {
        if (
          value &&
          !/^https?:\/\/(localhost|127\.0\.0\.1|\S+\.\S+)(:\d+)?(\/\S*)?$/.test(
            value
          )
        ) {
          throw new Error(
            "Profile must be a valid URL including localhost or domain."
          );
        }
      },
    },
        comment: "The profile Image should be correct url link."
    }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
});

export { User };