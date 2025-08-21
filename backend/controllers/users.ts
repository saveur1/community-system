import { Controller, Get, Post, Put, Delete, Route, Tags, Response, SuccessResponse, Body, Path, Query, Security } from 'tsoa';
import { ServiceResponse } from '../utils/serviceResponse';
import { User } from '../models/users';
import { Role } from '../models/role';
import { IUserCreateRequest, IUserResponse, IUserUpdateRequest } from '../types/user-controller-types';
import { asyncCatch } from '../middlewares/errorHandler';
import { hash } from 'bcrypt';
import sequelize from '../config/database';

@Route("api/users")
@Tags("Users")
export class UserController extends Controller {

  private async _buildUserResponse(user: User): Promise<IUserResponse> {
    const roles = await user.getRoles({
      attributes: ['id', 'name', 'description'],
    });
    const { password, resetPasswordCode, resetPasswordExpires, ...userData } = user.toJSON();
    return {
      ...userData,
      roles,
    };
  }

  @Security("jwt", ["user:create", "user:update", "user:delete"])
  @Get("/")
  @asyncCatch
  public async getUsers(
    @Query() page: number = 1,
    @Query() limit: number = 10
  ): Promise<ServiceResponse<IUserResponse[]>> {
    const offset = (page - 1) * limit;
    const { count, rows: users } = await User.findAndCountAll({
      limit,
      offset,
      include: [{ model: Role, as: 'roles', attributes: ['id', 'name', 'description'], through: { attributes: [] } }],
      order: [['createdAt', 'DESC']],
      distinct: true,
    });

    const userResponses = await Promise.all(users.map(user => this._buildUserResponse(user)));

    return ServiceResponse.success('Users retrieved successfully', userResponses, 200, { total: count, page, totalPages: Math.ceil(count / limit) });
  }

  @Security("jwt", ["user:view"])
  @Get("/{userId}")
  @asyncCatch
  @Response<ServiceResponse<null>>(404, "User not found")
  public async getUserById(
    @Path() userId: string
  ): Promise<ServiceResponse<IUserResponse | null>> {
    const user = await User.findByPk(userId);

    if (!user) {
      return ServiceResponse.failure('User not found', null, 404);
    }

    const userResponse = await this._buildUserResponse(user);
    return ServiceResponse.success('User retrieved successfully', userResponse);
  }

  @Security("jwt", ["user:create"])
  @Post("/")
  @Response<ServiceResponse<null>>(400, "Email already in use")
  public async createUser(
    @Body() userData: IUserCreateRequest
  ): Promise<ServiceResponse<IUserResponse | null>> {
    if (await User.findOne({ where: { email: userData.email } })) {
      return ServiceResponse.failure('Email already in use', null, 400);
    }

    const hashedPassword = await hash(userData.password, 10);

    const newUser = await sequelize.transaction(async (t) => {
      const user = await User.create({ ...userData, password: hashedPassword, status: 'active' }, { transaction: t });
      const userRole = await Role.findOne({ where: { name: 'user' }, transaction: t });
      if (userRole) {
        await user.addRole(userRole, { transaction: t });
      }
      return user;
    });

    const userResponse = await this._buildUserResponse(newUser);
    this.setStatus(201);
    return ServiceResponse.success('User created successfully', userResponse, 201);
  }

  @Security("jwt", ["user:update"])
  @Put("/{userId}")
  @Response<ServiceResponse<null>>(404, "User not found")
  @Response<ServiceResponse<null>>(400, "Email already in use")
  @asyncCatch
  public async updateUser(
    @Path() userId: string,
    @Body() userData: IUserUpdateRequest
  ): Promise<ServiceResponse<IUserResponse | null>> {
    const user = await User.findByPk(userId);
    if (!user) {
      return ServiceResponse.failure('User not found', null, 404);
    }

    if (userData.email && userData.email !== user.email) {
      if (await User.findOne({ where: { email: userData.email } })) {
        return ServiceResponse.failure('Email already in use', null, 400);
      }
    }

    await user.update(userData);
    const userResponse = await this._buildUserResponse(user);
    return ServiceResponse.success('User updated successfully', userResponse);
  }

  @Security("jwt", ["user:delete"])
  @Delete("/{userId}")
  @SuccessResponse(204, "No Content")
  @Response<ServiceResponse<null>>(404, "User not found")
  @asyncCatch
  public async deleteUser(
    @Path() userId: string
  ): Promise<ServiceResponse<null>> {
    const user = await User.findByPk(userId);
    if (!user) {
      return ServiceResponse.failure('User not found', null, 404);
    }

    await user.destroy();
    this.setStatus(204);
    return ServiceResponse.success('User deleted successfully', null, 204);
  }
}
