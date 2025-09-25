/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserController } from './../controllers/users';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SystemLogController } from './../controllers/system-logs';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SurveyController } from './../controllers/surveys';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { StatisticsController } from './../controllers/statistics';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RolesController } from './../controllers/roles';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ProjectController } from './../controllers/projects';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PermissionsController } from './../controllers/permissions';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OrganizationController } from './../controllers/organization';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { OrganizationVerificationController } from './../controllers/organization';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { NotificationController } from './../controllers/notifications';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { FeedbackController } from './../controllers/feedback';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { DocumentController } from './../controllers/documents';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CommunitySessionController } from './../controllers/community-sessions';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './../controllers/auth';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AnnouncementController } from './../controllers/announcements';
import { expressAuthentication } from './../middlewares/auth';
// @ts-ignore - no great way to install types from subpackage
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';

const expressAuthenticationRecasted = expressAuthentication as (req: ExRequest, securityName: string, scopes?: string[], res?: ExResponse) => Promise<any>;


// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "UserStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["pending"]},{"dataType":"enum","enums":["active"]},{"dataType":"enum","enums":["inactive"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IPermissionAttributes": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "createdAt": {"dataType":"datetime"},
            "updatedAt": {"dataType":"datetime"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IRoleAttributes": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "category": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "stakeholderId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "createdAt": {"dataType":"datetime"},
            "updatedAt": {"dataType":"datetime"},
            "permissions": {"dataType":"array","array":{"dataType":"refObject","ref":"IPermissionAttributes"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_IUserAttributes.Exclude_keyofIUserAttributes.password-or-resetPasswordCode-or-resetPasswordExpires-or-googleId__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"id":{"dataType":"string","required":true},"name":{"dataType":"string","required":true},"email":{"dataType":"string"},"address":{"dataType":"string"},"phone":{"dataType":"string"},"status":{"ref":"UserStatus","required":true},"salary":{"dataType":"double"},"profile":{"dataType":"string"},"emailVerified":{"dataType":"boolean"},"userType":{"dataType":"string"},"district":{"dataType":"string"},"sector":{"dataType":"string"},"cell":{"dataType":"string"},"village":{"dataType":"string"},"preferredLanguage":{"dataType":"string"},"nearByHealthCenter":{"dataType":"string"},"schoolName":{"dataType":"string"},"schoolAddress":{"dataType":"string"},"churchName":{"dataType":"string"},"churchAddress":{"dataType":"string"},"hospitalName":{"dataType":"string"},"hospitalAddress":{"dataType":"string"},"healthCenterName":{"dataType":"string"},"healthCenterAddress":{"dataType":"string"},"epiDistrict":{"dataType":"string"},"roles":{"dataType":"array","array":{"dataType":"refObject","ref":"IRoleAttributes"}},"userRoles":{"dataType":"array","array":{"dataType":"any"}},"createdAt":{"dataType":"datetime"},"updatedAt":{"dataType":"datetime"}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IUserResponse": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "name": {"dataType":"string","required":true},
            "email": {"dataType":"string"},
            "address": {"dataType":"string"},
            "phone": {"dataType":"string"},
            "status": {"ref":"UserStatus","required":true},
            "salary": {"dataType":"double"},
            "profile": {"dataType":"string"},
            "emailVerified": {"dataType":"boolean"},
            "userType": {"dataType":"string"},
            "district": {"dataType":"string"},
            "sector": {"dataType":"string"},
            "cell": {"dataType":"string"},
            "village": {"dataType":"string"},
            "preferredLanguage": {"dataType":"string"},
            "nearByHealthCenter": {"dataType":"string"},
            "schoolName": {"dataType":"string"},
            "schoolAddress": {"dataType":"string"},
            "churchName": {"dataType":"string"},
            "churchAddress": {"dataType":"string"},
            "hospitalName": {"dataType":"string"},
            "hospitalAddress": {"dataType":"string"},
            "healthCenterName": {"dataType":"string"},
            "healthCenterAddress": {"dataType":"string"},
            "epiDistrict": {"dataType":"string"},
            "roles": {"dataType":"array","array":{"dataType":"refObject","ref":"IRoleAttributes"}},
            "userRoles": {"dataType":"array","array":{"dataType":"any"}},
            "createdAt": {"dataType":"datetime"},
            "updatedAt": {"dataType":"datetime"},
            "profileImage": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ServiceResponse_IUserResponse-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"refObject","ref":"IUserResponse"}},{"dataType":"enum","enums":[null]}],"required":true},
            "statusCode": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ServiceResponse_IUserResponse-or-null_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"union","subSchemas":[{"ref":"IUserResponse"},{"dataType":"enum","enums":[null]}]},{"dataType":"enum","enums":[null]}],"required":true},
            "statusCode": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ServiceResponse_null_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":[null]},{"dataType":"enum","enums":[null]}],"required":true},
            "statusCode": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IUserCreateRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string"},
            "address": {"dataType":"string"},
            "phone": {"dataType":"string"},
            "role": {"dataType":"array","array":{"dataType":"refObject","ref":"IRoleAttributes"}},
            "status": {"ref":"UserStatus"},
            "profileImage": {"dataType":"string"},
            "district": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "sector": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "cell": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "village": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "userType": {"dataType":"string"},
            "roleIds": {"dataType":"array","array":{"dataType":"string"}},
            "stakeholderId": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IUserUpdateRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "email": {"dataType":"string"},
            "password": {"dataType":"string"},
            "address": {"dataType":"string"},
            "phone": {"dataType":"string"},
            "role": {"dataType":"array","array":{"dataType":"refObject","ref":"IRoleAttributes"}},
            "status": {"ref":"UserStatus"},
            "profileImage": {"dataType":"string"},
            "district": {"dataType":"string"},
            "sector": {"dataType":"string"},
            "cell": {"dataType":"string"},
            "village": {"dataType":"string"},
            "userType": {"dataType":"string"},
            "roleIds": {"dataType":"array","array":{"dataType":"string"}},
            "stakeholderId": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ServiceResponse_any-Array_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"any"}},{"dataType":"enum","enums":[null]}],"required":true},
            "statusCode": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ServiceResponse_any-or-null_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"union","subSchemas":[{"dataType":"any"},{"dataType":"enum","enums":[null]}]},{"dataType":"enum","enums":[null]}],"required":true},
            "statusCode": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ServiceResponse_any_": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"any"},{"dataType":"enum","enums":[null]}],"required":true},
            "statusCode": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SurveyCreateRequest": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string","required":true},
            "description": {"dataType":"string","required":true},
            "projectId": {"dataType":"string"},
            "surveyType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["general"]},{"dataType":"enum","enums":["report-form"]},{"dataType":"enum","enums":["rapid-enquiry"]},{"dataType":"undefined"}],"required":true},
            "startAt": {"dataType":"string","required":true},
            "endAt": {"dataType":"string","required":true},
            "estimatedTime": {"dataType":"string","required":true},
            "sections": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"description":{"dataType":"string"},"title":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}},"required":true},
            "questions": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"options":{"dataType":"array","array":{"dataType":"string"},"required":true},"questionNumber":{"dataType":"double"},"sectionId":{"dataType":"string","required":true},"required":{"dataType":"boolean","required":true},"description":{"dataType":"string","required":true},"title":{"dataType":"string","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["single_choice"]},{"dataType":"enum","enums":["multiple_choice"]}],"required":true},"id":{"dataType":"double","required":true}}},{"dataType":"nestedObjectLiteral","nestedProperties":{"placeholder":{"dataType":"string","required":true},"questionNumber":{"dataType":"double"},"sectionId":{"dataType":"string","required":true},"required":{"dataType":"boolean","required":true},"description":{"dataType":"string","required":true},"title":{"dataType":"string","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["text_input"]},{"dataType":"enum","enums":["textarea"]}],"required":true},"id":{"dataType":"double","required":true}}},{"dataType":"nestedObjectLiteral","nestedProperties":{"maxSize":{"dataType":"double","required":true},"allowedTypes":{"dataType":"array","array":{"dataType":"string"},"required":true},"questionNumber":{"dataType":"double"},"sectionId":{"dataType":"string","required":true},"required":{"dataType":"boolean","required":true},"description":{"dataType":"string","required":true},"title":{"dataType":"string","required":true},"type":{"dataType":"enum","enums":["file_upload"],"required":true},"id":{"dataType":"double","required":true}}},{"dataType":"nestedObjectLiteral","nestedProperties":{"ratingLabel":{"dataType":"string"},"maxRating":{"dataType":"double","required":true},"questionNumber":{"dataType":"double"},"sectionId":{"dataType":"string","required":true},"required":{"dataType":"boolean","required":true},"description":{"dataType":"string","required":true},"title":{"dataType":"string","required":true},"type":{"dataType":"enum","enums":["rating"],"required":true},"id":{"dataType":"double","required":true}}},{"dataType":"nestedObjectLiteral","nestedProperties":{"maxLabel":{"dataType":"string"},"minLabel":{"dataType":"string"},"maxValue":{"dataType":"double","required":true},"minValue":{"dataType":"double","required":true},"questionNumber":{"dataType":"double"},"sectionId":{"dataType":"string","required":true},"required":{"dataType":"boolean","required":true},"description":{"dataType":"string","required":true},"title":{"dataType":"string","required":true},"type":{"dataType":"enum","enums":["linear_scale"],"required":true},"id":{"dataType":"double","required":true}}}]},"required":true},
            "allowedRoles": {"dataType":"array","array":{"dataType":"string"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SurveyUpdateRequest": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string"},
            "description": {"dataType":"string"},
            "projectId": {"dataType":"string"},
            "surveyType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["general"]},{"dataType":"enum","enums":["report-form"]},{"dataType":"enum","enums":["rapid-enquiry"]}]},
            "startAt": {"dataType":"string"},
            "endAt": {"dataType":"string"},
            "estimatedTime": {"dataType":"string"},
            "sections": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"description":{"dataType":"string"},"title":{"dataType":"string","required":true},"id":{"dataType":"string","required":true}}}},
            "questions": {"dataType":"array","array":{"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"options":{"dataType":"array","array":{"dataType":"string"},"required":true},"questionNumber":{"dataType":"double"},"sectionId":{"dataType":"string","required":true},"required":{"dataType":"boolean","required":true},"description":{"dataType":"string","required":true},"title":{"dataType":"string","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["single_choice"]},{"dataType":"enum","enums":["multiple_choice"]}],"required":true},"id":{"dataType":"double","required":true}}},{"dataType":"nestedObjectLiteral","nestedProperties":{"placeholder":{"dataType":"string","required":true},"questionNumber":{"dataType":"double"},"sectionId":{"dataType":"string","required":true},"required":{"dataType":"boolean","required":true},"description":{"dataType":"string","required":true},"title":{"dataType":"string","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["text_input"]},{"dataType":"enum","enums":["textarea"]}],"required":true},"id":{"dataType":"double","required":true}}},{"dataType":"nestedObjectLiteral","nestedProperties":{"maxSize":{"dataType":"double","required":true},"allowedTypes":{"dataType":"array","array":{"dataType":"string"},"required":true},"questionNumber":{"dataType":"double"},"sectionId":{"dataType":"string","required":true},"required":{"dataType":"boolean","required":true},"description":{"dataType":"string","required":true},"title":{"dataType":"string","required":true},"type":{"dataType":"enum","enums":["file_upload"],"required":true},"id":{"dataType":"double","required":true}}},{"dataType":"nestedObjectLiteral","nestedProperties":{"ratingLabel":{"dataType":"string"},"maxRating":{"dataType":"double","required":true},"questionNumber":{"dataType":"double"},"sectionId":{"dataType":"string","required":true},"required":{"dataType":"boolean","required":true},"description":{"dataType":"string","required":true},"title":{"dataType":"string","required":true},"type":{"dataType":"enum","enums":["rating"],"required":true},"id":{"dataType":"double","required":true}}},{"dataType":"nestedObjectLiteral","nestedProperties":{"maxLabel":{"dataType":"string"},"minLabel":{"dataType":"string"},"maxValue":{"dataType":"double","required":true},"minValue":{"dataType":"double","required":true},"questionNumber":{"dataType":"double"},"sectionId":{"dataType":"string","required":true},"required":{"dataType":"boolean","required":true},"description":{"dataType":"string","required":true},"title":{"dataType":"string","required":true},"type":{"dataType":"enum","enums":["linear_scale"],"required":true},"id":{"dataType":"double","required":true}}}]}},
            "allowedRoles": {"dataType":"array","array":{"dataType":"string"}},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["draft"]},{"dataType":"enum","enums":["active"]},{"dataType":"enum","enums":["paused"]},{"dataType":"enum","enums":["archived"]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Period": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["daily"]},{"dataType":"enum","enums":["weekly"]},{"dataType":"enum","enums":["monthly"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RoleCreateRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "category": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "permissionIds": {"dataType":"array","array":{"dataType":"string"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RoleUpdateRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "description": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "category": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "permissionIds": {"dataType":"array","array":{"dataType":"string"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProjectCreateRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["draft"]},{"dataType":"enum","enums":["in_progress"]},{"dataType":"enum","enums":["completed"]},{"dataType":"enum","enums":["on_hold"]},{"dataType":"enum","enums":["cancelled"]}]},
            "targetGroup": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "projectDuration": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "geographicArea": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "stakeholderIds": {"dataType":"array","array":{"dataType":"string"}},
            "donorIds": {"dataType":"array","array":{"dataType":"string"}},
            "documents": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"deleteToken":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"publicId":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"userId":{"dataType":"string","required":true},"documentUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"addedAt":{"dataType":"datetime"},"type":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"size":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},"documentName":{"dataType":"string","required":true}}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProjectUpdateRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["draft"]},{"dataType":"enum","enums":["in_progress"]},{"dataType":"enum","enums":["completed"]},{"dataType":"enum","enums":["on_hold"]},{"dataType":"enum","enums":["cancelled"]}]},
            "targetGroup": {"dataType":"string"},
            "projectDuration": {"dataType":"string"},
            "geographicArea": {"dataType":"string"},
            "stakeholderIds": {"dataType":"array","array":{"dataType":"string"}},
            "donorIds": {"dataType":"array","array":{"dataType":"string"}},
            "documents": {"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"deleteToken":{"dataType":"string"},"publicId":{"dataType":"string"},"userId":{"dataType":"string","required":true},"documentUrl":{"dataType":"string"},"addedAt":{"dataType":"datetime"},"type":{"dataType":"string"},"size":{"dataType":"double"},"documentName":{"dataType":"string","required":true}}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PermissionCreateRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "description": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PermissionUpdateRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string"},
            "description": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ServiceResponse__count-number__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"count":{"dataType":"double","required":true}}},{"dataType":"enum","enums":[null]}],"required":true},
            "statusCode": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "NotificationCreateRequest": {
        "dataType": "refObject",
        "properties": {
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["survey"]},{"dataType":"enum","enums":["feedback"]},{"dataType":"enum","enums":["community_session"]},{"dataType":"enum","enums":["system"]}],"required":true},
            "title": {"dataType":"string","required":true},
            "message": {"dataType":"string","required":true},
            "icon": {"dataType":"string"},
            "link": {"dataType":"string"},
            "entityId": {"dataType":"string"},
            "entityType": {"dataType":"string"},
            "userIds": {"dataType":"array","array":{"dataType":"string"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "NotificationUpdateRequest": {
        "dataType": "refObject",
        "properties": {
            "isRead": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ServiceResponse__updated-number__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"updated":{"dataType":"double","required":true}}},{"dataType":"enum","enums":[null]}],"required":true},
            "statusCode": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ServiceResponse__deleted-number__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"deleted":{"dataType":"double","required":true}}},{"dataType":"enum","enums":[null]}],"required":true},
            "statusCode": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DocumentInput": {
        "dataType": "refObject",
        "properties": {
            "documentName": {"dataType":"string","required":true},
            "documentUrl": {"dataType":"string","required":true},
            "type": {"dataType":"string","required":true},
            "size": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},
            "publicId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "deleteToken": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FeedbackCreateRequest": {
        "dataType": "refObject",
        "properties": {
            "projectId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "mainMessage": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "feedbackType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["positive"]},{"dataType":"enum","enums":["negative"]},{"dataType":"enum","enums":["suggestion"]},{"dataType":"enum","enums":["concern"]},{"dataType":"enum","enums":[null]}]},
            "feedbackMethod": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["text"]},{"dataType":"enum","enums":["voice"]},{"dataType":"enum","enums":["video"]}],"required":true},
            "suggestions": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "followUpNeeded": {"dataType":"boolean"},
            "documents": {"dataType":"array","array":{"dataType":"refObject","ref":"DocumentInput"}},
            "responderName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "otherFeedbackOn": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FeedbackReplyCreateRequest": {
        "dataType": "refObject",
        "properties": {
            "subject": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "message": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "FeedbackUpdateRequest": {
        "dataType": "refObject",
        "properties": {
            "projectId": {"dataType":"string"},
            "mainMessage": {"dataType":"string"},
            "feedbackType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["positive"]},{"dataType":"enum","enums":["negative"]},{"dataType":"enum","enums":["suggestion"]},{"dataType":"enum","enums":["concern"]}]},
            "feedbackMethod": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["text"]},{"dataType":"enum","enums":["voice"]},{"dataType":"enum","enums":["video"]}]},
            "suggestions": {"dataType":"string"},
            "followUpNeeded": {"dataType":"boolean"},
            "documents": {"dataType":"array","array":{"dataType":"refObject","ref":"DocumentInput"}},
            "responderName": {"dataType":"string"},
            "otherFeedbackOn": {"dataType":"string"},
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["submitted"]},{"dataType":"enum","enums":["Acknowledged"]},{"dataType":"enum","enums":["Resolved"]},{"dataType":"enum","enums":["Rejected"]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DocumentCreateRequest": {
        "dataType": "refObject",
        "properties": {
            "projectId": {"dataType":"string"},
            "documentName": {"dataType":"string","required":true},
            "size": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},
            "type": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "addedAt": {"dataType":"datetime"},
            "documentUrl": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "userId": {"dataType":"string","required":true},
            "publicId": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "deleteToken": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DocumentUpdateRequest": {
        "dataType": "refObject",
        "properties": {
            "projectId": {"dataType":"string"},
            "documentName": {"dataType":"string"},
            "size": {"dataType":"double"},
            "type": {"dataType":"string"},
            "addedAt": {"dataType":"datetime"},
            "documentUrl": {"dataType":"string"},
            "userId": {"dataType":"string"},
            "publicId": {"dataType":"string"},
            "deleteToken": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommunitySessionCreateRequest": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string","required":true},
            "shortDescription": {"dataType":"string","required":true},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["video"]},{"dataType":"enum","enums":["image"]},{"dataType":"enum","enums":["document"]},{"dataType":"enum","enums":["audio"]}],"required":true},
            "allowedRoles": {"dataType":"array","array":{"dataType":"string"},"required":true},
            "document": {"dataType":"nestedObjectLiteral","nestedProperties":{"deleteToken":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"publicId":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"userId":{"dataType":"string","required":true},"documentUrl":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"addedAt":{"dataType":"datetime"},"type":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"size":{"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}]},"documentName":{"dataType":"string","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommunitySessionUpdateRequest": {
        "dataType": "refObject",
        "properties": {
            "title": {"dataType":"string"},
            "shortDescription": {"dataType":"string"},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["video"]},{"dataType":"enum","enums":["document"]},{"dataType":"enum","enums":["image"]},{"dataType":"enum","enums":["audio"]}]},
            "allowedRoles": {"dataType":"array","array":{"dataType":"string"}},
            "document": {"dataType":"nestedObjectLiteral","nestedProperties":{"deleteToken":{"dataType":"string"},"publicId":{"dataType":"string"},"userId":{"dataType":"string","required":true},"documentUrl":{"dataType":"string"},"addedAt":{"dataType":"datetime"},"type":{"dataType":"string"},"size":{"dataType":"double"},"documentName":{"dataType":"string","required":true}}},
            "isActive": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CommentCreateRequest": {
        "dataType": "refObject",
        "properties": {
            "content": {"dataType":"string","required":true},
            "timestamp": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginRequest": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string"},
            "phone": {"dataType":"string"},
            "identifier": {"dataType":"string"},
            "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["email"]},{"dataType":"enum","enums":["phone"]}]},
            "loginValue": {"dataType":"string"},
            "password": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ServiceResponse__user-IUserResponse-or-null__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"user":{"dataType":"union","subSchemas":[{"ref":"IUserResponse"},{"dataType":"enum","enums":[null]}],"required":true}}},{"dataType":"enum","enums":[null]}],"required":true},
            "statusCode": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SignupRequest": {
        "dataType": "refObject",
        "properties": {
            "name": {"dataType":"string","required":true},
            "email": {"dataType":"string"},
            "password": {"dataType":"string","required":true},
            "address": {"dataType":"string"},
            "phone": {"dataType":"string","required":true},
            "roleType": {"dataType":"string"},
            "userType": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "district": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "sector": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "cell": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "village": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "preferredLanguage": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "nearByHealthCenter": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "schoolName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "schoolAddress": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "churchName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "churchAddress": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "hospitalName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "hospitalAddress": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "healthCenterName": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "healthCenterAddress": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
            "epiDistrict": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ForgotPasswordRequest": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResetPasswordRequest": {
        "dataType": "refObject",
        "properties": {
            "token": {"dataType":"string","required":true},
            "newPassword": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ServiceResponse__success-boolean__": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"dataType":"string","required":true},
            "result": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"success":{"dataType":"boolean","required":true}}},{"dataType":"enum","enums":[null]}],"required":true},
            "statusCode": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChangePasswordRequest": {
        "dataType": "refObject",
        "properties": {
            "oldPassword": {"dataType":"string","required":true},
            "newPassword": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsUserController_getUsers: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                search: {"in":"query","name":"search","dataType":"string"},
                userType: {"in":"query","name":"userType","dataType":"string"},
        };
        app.get('/api/users',
            authenticateMiddleware([{"jwt":["user:create","user:update","user:delete"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getUsers)),

            async function UserController_getUsers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getUsers, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'getUsers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_getUserById: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/api/users/:userId',
            authenticateMiddleware([{"jwt":["user:view"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getUserById)),

            async function UserController_getUserById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getUserById, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'getUserById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_createUser: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                userData: {"in":"body","name":"userData","required":true,"ref":"IUserCreateRequest"},
        };
        app.post('/api/users',
            authenticateMiddleware([{"jwt":["user:create"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.createUser)),

            async function UserController_createUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_createUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'createUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_updateUser: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
                userData: {"in":"body","name":"userData","required":true,"ref":"IUserUpdateRequest"},
        };
        app.put('/api/users/:userId',
            authenticateMiddleware([{"jwt":["user:update"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.updateUser)),

            async function UserController_updateUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_updateUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'updateUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_updateUserRoles: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
                roleData: {"in":"body","name":"roleData","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"roleIds":{"dataType":"array","array":{"dataType":"string"},"required":true}}},
        };
        app.put('/api/users/:userId/roles',
            authenticateMiddleware([{"jwt":["user:update"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.updateUserRoles)),

            async function UserController_updateUserRoles(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_updateUserRoles, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'updateUserRoles',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_deleteUser: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.delete('/api/users/:userId',
            authenticateMiddleware([{"jwt":["user:delete"]}]),
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.deleteUser)),

            async function UserController_deleteUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_deleteUser, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'deleteUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSystemLogController_listLogs: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":25,"in":"query","name":"limit","dataType":"double"},
                userId: {"in":"query","name":"userId","dataType":"string"},
                action: {"in":"query","name":"action","dataType":"string"},
                resourceType: {"in":"query","name":"resourceType","dataType":"string"},
                startDate: {"in":"query","name":"startDate","dataType":"string"},
                endDate: {"in":"query","name":"endDate","dataType":"string"},
        };
        app.get('/api/system-logs',
            authenticateMiddleware([{"jwt":["system_log:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(SystemLogController)),
            ...(fetchMiddlewares<RequestHandler>(SystemLogController.prototype.listLogs)),

            async function SystemLogController_listLogs(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSystemLogController_listLogs, request, response });

                const controller = new SystemLogController();

              await templateService.apiHandler({
                methodName: 'listLogs',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSystemLogController_getLogById: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/api/system-logs/:id',
            authenticateMiddleware([{"jwt":["system_log:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(SystemLogController)),
            ...(fetchMiddlewares<RequestHandler>(SystemLogController.prototype.getLogById)),

            async function SystemLogController_getLogById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSystemLogController_getLogById, request, response });

                const controller = new SystemLogController();

              await templateService.apiHandler({
                methodName: 'getLogById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSystemLogController_deleteLog: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.delete('/api/system-logs/:id',
            authenticateMiddleware([{"jwt":["system_log:delete"]}]),
            ...(fetchMiddlewares<RequestHandler>(SystemLogController)),
            ...(fetchMiddlewares<RequestHandler>(SystemLogController.prototype.deleteLog)),

            async function SystemLogController_deleteLog(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSystemLogController_deleteLog, request, response });

                const controller = new SystemLogController();

              await templateService.apiHandler({
                methodName: 'deleteLog',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSystemLogController_createLog: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"meta":{"dataType":"union","subSchemas":[{"dataType":"any"},{"dataType":"enum","enums":[null]}]},"resourceId":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"resourceType":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"action":{"dataType":"string","required":true}}},
        };
        app.post('/api/system-logs',
            authenticateMiddleware([{"jwt":["system_log:create"]}]),
            ...(fetchMiddlewares<RequestHandler>(SystemLogController)),
            ...(fetchMiddlewares<RequestHandler>(SystemLogController.prototype.createLog)),

            async function SystemLogController_createLog(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSystemLogController_createLog, request, response });

                const controller = new SystemLogController();

              await templateService.apiHandler({
                methodName: 'createLog',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSurveyController_getSurveys: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                status: {"in":"query","name":"status","dataType":"union","subSchemas":[{"dataType":"enum","enums":["draft"]},{"dataType":"enum","enums":["active"]},{"dataType":"enum","enums":["paused"]},{"dataType":"enum","enums":["archived"]}]},
                surveyType: {"in":"query","name":"surveyType","dataType":"union","subSchemas":[{"dataType":"enum","enums":["general"]},{"dataType":"enum","enums":["report-form"]},{"dataType":"enum","enums":["rapid-enquiry"]}]},
                owner: {"in":"query","name":"owner","dataType":"union","subSchemas":[{"dataType":"enum","enums":["me"]},{"dataType":"enum","enums":["others"]},{"dataType":"enum","enums":["any"]}]},
                responded: {"in":"query","name":"responded","dataType":"boolean"},
                allowed: {"in":"query","name":"allowed","dataType":"boolean"},
                available: {"in":"query","name":"available","dataType":"boolean"},
                startDate: {"in":"query","name":"startDate","dataType":"string"},
                endDate: {"in":"query","name":"endDate","dataType":"string"},
                search: {"in":"query","name":"search","dataType":"string"},
        };
        app.get('/api/surveys',
            authenticateMiddleware([{"jwt":["survey:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(SurveyController)),
            ...(fetchMiddlewares<RequestHandler>(SurveyController.prototype.getSurveys)),

            async function SurveyController_getSurveys(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSurveyController_getSurveys, request, response });

                const controller = new SurveyController();

              await templateService.apiHandler({
                methodName: 'getSurveys',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSurveyController_getSurveyAnalytics: Record<string, TsoaRoute.ParameterSchema> = {
                surveyId: {"in":"path","name":"surveyId","required":true,"dataType":"string"},
                startDate: {"in":"query","name":"startDate","dataType":"string"},
                endDate: {"in":"query","name":"endDate","dataType":"string"},
        };
        app.get('/api/surveys/:surveyId/analytics',
            authenticateMiddleware([{"jwt":["survey:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(SurveyController)),
            ...(fetchMiddlewares<RequestHandler>(SurveyController.prototype.getSurveyAnalytics)),

            async function SurveyController_getSurveyAnalytics(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSurveyController_getSurveyAnalytics, request, response });

                const controller = new SurveyController();

              await templateService.apiHandler({
                methodName: 'getSurveyAnalytics',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSurveyController_getSurveyResponses: Record<string, TsoaRoute.ParameterSchema> = {
                surveyId: {"in":"query","name":"surveyId","dataType":"string"},
                responderId: {"in":"query","name":"responderId","dataType":"string"},
                surveyType: {"in":"query","name":"surveyType","dataType":"union","subSchemas":[{"dataType":"enum","enums":["report-form"]},{"dataType":"enum","enums":["general"]},{"dataType":"enum","enums":["rapid-enquiry"]}]},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                search: {"in":"query","name":"search","dataType":"string"},
        };
        app.get('/api/surveys/responses',
            authenticateMiddleware([{"jwt":["survey:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(SurveyController)),
            ...(fetchMiddlewares<RequestHandler>(SurveyController.prototype.getSurveyResponses)),

            async function SurveyController_getSurveyResponses(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSurveyController_getSurveyResponses, request, response });

                const controller = new SurveyController();

              await templateService.apiHandler({
                methodName: 'getSurveyResponses',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSurveyController_getSurveyById: Record<string, TsoaRoute.ParameterSchema> = {
                surveyId: {"in":"path","name":"surveyId","required":true,"dataType":"string"},
        };
        app.get('/api/surveys/:surveyId',
            authenticateMiddleware([{"optionalJwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SurveyController)),
            ...(fetchMiddlewares<RequestHandler>(SurveyController.prototype.getSurveyById)),

            async function SurveyController_getSurveyById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSurveyController_getSurveyById, request, response });

                const controller = new SurveyController();

              await templateService.apiHandler({
                methodName: 'getSurveyById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSurveyController_createSurvey: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                data: {"in":"body","name":"data","required":true,"ref":"SurveyCreateRequest"},
        };
        app.post('/api/surveys',
            authenticateMiddleware([{"jwt":["survey:create"]}]),
            ...(fetchMiddlewares<RequestHandler>(SurveyController)),
            ...(fetchMiddlewares<RequestHandler>(SurveyController.prototype.createSurvey)),

            async function SurveyController_createSurvey(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSurveyController_createSurvey, request, response });

                const controller = new SurveyController();

              await templateService.apiHandler({
                methodName: 'createSurvey',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSurveyController_updateSurvey: Record<string, TsoaRoute.ParameterSchema> = {
                surveyId: {"in":"path","name":"surveyId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                data: {"in":"body","name":"data","required":true,"ref":"SurveyUpdateRequest"},
        };
        app.put('/api/surveys/:surveyId',
            authenticateMiddleware([{"jwt":["survey:update"]}]),
            ...(fetchMiddlewares<RequestHandler>(SurveyController)),
            ...(fetchMiddlewares<RequestHandler>(SurveyController.prototype.updateSurvey)),

            async function SurveyController_updateSurvey(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSurveyController_updateSurvey, request, response });

                const controller = new SurveyController();

              await templateService.apiHandler({
                methodName: 'updateSurvey',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSurveyController_deleteSurvey: Record<string, TsoaRoute.ParameterSchema> = {
                surveyId: {"in":"path","name":"surveyId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","dataType":"object"},
        };
        app.delete('/api/surveys/:surveyId',
            authenticateMiddleware([{"jwt":["survey:delete"]}]),
            ...(fetchMiddlewares<RequestHandler>(SurveyController)),
            ...(fetchMiddlewares<RequestHandler>(SurveyController.prototype.deleteSurvey)),

            async function SurveyController_deleteSurvey(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSurveyController_deleteSurvey, request, response });

                const controller = new SurveyController();

              await templateService.apiHandler({
                methodName: 'deleteSurvey',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSurveyController_submitAnswers: Record<string, TsoaRoute.ParameterSchema> = {
                surveyId: {"in":"path","name":"surveyId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"answers":{"dataType":"array","array":{"dataType":"nestedObjectLiteral","nestedProperties":{"answerOptions":{"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"string"}},{"dataType":"enum","enums":[null]}]},"answerText":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"questionId":{"dataType":"string","required":true}}},"required":true},"userId":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]}}},
        };
        app.post('/api/surveys/:surveyId/answers',
            authenticateMiddleware([{"optionalJwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SurveyController)),
            ...(fetchMiddlewares<RequestHandler>(SurveyController.prototype.submitAnswers)),

            async function SurveyController_submitAnswers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSurveyController_submitAnswers, request, response });

                const controller = new SurveyController();

              await templateService.apiHandler({
                methodName: 'submitAnswers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSurveyController_getResponseById: Record<string, TsoaRoute.ParameterSchema> = {
                responseId: {"in":"path","name":"responseId","required":true,"dataType":"string"},
        };
        app.get('/api/surveys/response/:responseId',
            authenticateMiddleware([{"jwt":["survey:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(SurveyController)),
            ...(fetchMiddlewares<RequestHandler>(SurveyController.prototype.getResponseById)),

            async function SurveyController_getResponseById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSurveyController_getResponseById, request, response });

                const controller = new SurveyController();

              await templateService.apiHandler({
                methodName: 'getResponseById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSurveyController_getLatestRapidEnquiry: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/surveys/public/rapid-enquiry/latest',
            authenticateMiddleware([{"optionalJwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(SurveyController)),
            ...(fetchMiddlewares<RequestHandler>(SurveyController.prototype.getLatestRapidEnquiry)),

            async function SurveyController_getLatestRapidEnquiry(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSurveyController_getLatestRapidEnquiry, request, response });

                const controller = new SurveyController();

              await templateService.apiHandler({
                methodName: 'getLatestRapidEnquiry',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsStatisticsController_getOverview: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                startDate: {"in":"query","name":"startDate","dataType":"string"},
                endDate: {"in":"query","name":"endDate","dataType":"string"},
        };
        app.get('/api/statistics/overview',
            authenticateMiddleware([{"jwt":["dashboard:analytics","dashboard:community"]}]),
            ...(fetchMiddlewares<RequestHandler>(StatisticsController)),
            ...(fetchMiddlewares<RequestHandler>(StatisticsController.prototype.getOverview)),

            async function StatisticsController_getOverview(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsStatisticsController_getOverview, request, response });

                const controller = new StatisticsController();

              await templateService.apiHandler({
                methodName: 'getOverview',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsStatisticsController_getSurveysHistory: Record<string, TsoaRoute.ParameterSchema> = {
                group: {"default":"monthly","in":"query","name":"group","ref":"Period"},
                startDate: {"in":"query","name":"startDate","dataType":"string"},
                endDate: {"in":"query","name":"endDate","dataType":"string"},
                surveyId: {"in":"query","name":"surveyId","dataType":"string"},
        };
        app.get('/api/statistics/surveys-history',
            authenticateMiddleware([{"jwt":["dashboard:analytics"]}]),
            ...(fetchMiddlewares<RequestHandler>(StatisticsController)),
            ...(fetchMiddlewares<RequestHandler>(StatisticsController.prototype.getSurveysHistory)),

            async function StatisticsController_getSurveysHistory(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsStatisticsController_getSurveysHistory, request, response });

                const controller = new StatisticsController();

              await templateService.apiHandler({
                methodName: 'getSurveysHistory',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRolesController_listRoles: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"in":"query","name":"page","dataType":"double"},
                limit: {"in":"query","name":"limit","dataType":"double"},
                search: {"in":"query","name":"search","dataType":"string"},
                category: {"in":"query","name":"category","dataType":"string"},
        };
        app.get('/api/roles',
            authenticateMiddleware([{"jwt":["role:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(RolesController)),
            ...(fetchMiddlewares<RequestHandler>(RolesController.prototype.listRoles)),

            async function RolesController_listRoles(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRolesController_listRoles, request, response });

                const controller = new RolesController();

              await templateService.apiHandler({
                methodName: 'listRoles',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRolesController_getRole: Record<string, TsoaRoute.ParameterSchema> = {
                roleId: {"in":"path","name":"roleId","required":true,"dataType":"string"},
        };
        app.get('/api/roles/:roleId',
            authenticateMiddleware([{"jwt":["role:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(RolesController)),
            ...(fetchMiddlewares<RequestHandler>(RolesController.prototype.getRole)),

            async function RolesController_getRole(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRolesController_getRole, request, response });

                const controller = new RolesController();

              await templateService.apiHandler({
                methodName: 'getRole',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRolesController_createRole: Record<string, TsoaRoute.ParameterSchema> = {
                data: {"in":"body","name":"data","required":true,"ref":"RoleCreateRequest"},
        };
        app.post('/api/roles',
            authenticateMiddleware([{"jwt":["role:create"]}]),
            ...(fetchMiddlewares<RequestHandler>(RolesController)),
            ...(fetchMiddlewares<RequestHandler>(RolesController.prototype.createRole)),

            async function RolesController_createRole(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRolesController_createRole, request, response });

                const controller = new RolesController();

              await templateService.apiHandler({
                methodName: 'createRole',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRolesController_updateRole: Record<string, TsoaRoute.ParameterSchema> = {
                roleId: {"in":"path","name":"roleId","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"ref":"RoleUpdateRequest"},
        };
        app.put('/api/roles/:roleId',
            authenticateMiddleware([{"jwt":["role:update"]}]),
            ...(fetchMiddlewares<RequestHandler>(RolesController)),
            ...(fetchMiddlewares<RequestHandler>(RolesController.prototype.updateRole)),

            async function RolesController_updateRole(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRolesController_updateRole, request, response });

                const controller = new RolesController();

              await templateService.apiHandler({
                methodName: 'updateRole',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRolesController_deleteRole: Record<string, TsoaRoute.ParameterSchema> = {
                roleId: {"in":"path","name":"roleId","required":true,"dataType":"string"},
        };
        app.delete('/api/roles/:roleId',
            authenticateMiddleware([{"jwt":["role:delete"]}]),
            ...(fetchMiddlewares<RequestHandler>(RolesController)),
            ...(fetchMiddlewares<RequestHandler>(RolesController.prototype.deleteRole)),

            async function RolesController_deleteRole(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRolesController_deleteRole, request, response });

                const controller = new RolesController();

              await templateService.apiHandler({
                methodName: 'deleteRole',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRolesController_addPermission: Record<string, TsoaRoute.ParameterSchema> = {
                roleId: {"in":"path","name":"roleId","required":true,"dataType":"string"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"permissionId":{"dataType":"string","required":true}}},
        };
        app.post('/api/roles/:roleId/permissions',
            authenticateMiddleware([{"jwt":["role:update"]}]),
            ...(fetchMiddlewares<RequestHandler>(RolesController)),
            ...(fetchMiddlewares<RequestHandler>(RolesController.prototype.addPermission)),

            async function RolesController_addPermission(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRolesController_addPermission, request, response });

                const controller = new RolesController();

              await templateService.apiHandler({
                methodName: 'addPermission',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRolesController_removePermission: Record<string, TsoaRoute.ParameterSchema> = {
                roleId: {"in":"path","name":"roleId","required":true,"dataType":"string"},
                permissionId: {"in":"path","name":"permissionId","required":true,"dataType":"string"},
        };
        app.delete('/api/roles/:roleId/permissions/:permissionId',
            authenticateMiddleware([{"jwt":["role:update"]}]),
            ...(fetchMiddlewares<RequestHandler>(RolesController)),
            ...(fetchMiddlewares<RequestHandler>(RolesController.prototype.removePermission)),

            async function RolesController_removePermission(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRolesController_removePermission, request, response });

                const controller = new RolesController();

              await templateService.apiHandler({
                methodName: 'removePermission',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProjectController_getProjects: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/api/projects',
            authenticateMiddleware([{"jwt":["project:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProjectController)),
            ...(fetchMiddlewares<RequestHandler>(ProjectController.prototype.getProjects)),

            async function ProjectController_getProjects(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProjectController_getProjects, request, response });

                const controller = new ProjectController();

              await templateService.apiHandler({
                methodName: 'getProjects',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProjectController_getProjectById: Record<string, TsoaRoute.ParameterSchema> = {
                projectId: {"in":"path","name":"projectId","required":true,"dataType":"string"},
        };
        app.get('/api/projects/:projectId',
            authenticateMiddleware([{"jwt":["project:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProjectController)),
            ...(fetchMiddlewares<RequestHandler>(ProjectController.prototype.getProjectById)),

            async function ProjectController_getProjectById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProjectController_getProjectById, request, response });

                const controller = new ProjectController();

              await templateService.apiHandler({
                methodName: 'getProjectById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProjectController_createProject: Record<string, TsoaRoute.ParameterSchema> = {
                data: {"in":"body","name":"data","required":true,"ref":"ProjectCreateRequest"},
        };
        app.post('/api/projects',
            authenticateMiddleware([{"jwt":["project:create"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProjectController)),
            ...(fetchMiddlewares<RequestHandler>(ProjectController.prototype.createProject)),

            async function ProjectController_createProject(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProjectController_createProject, request, response });

                const controller = new ProjectController();

              await templateService.apiHandler({
                methodName: 'createProject',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProjectController_updateProject: Record<string, TsoaRoute.ParameterSchema> = {
                projectId: {"in":"path","name":"projectId","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"ref":"ProjectUpdateRequest"},
        };
        app.put('/api/projects/:projectId',
            authenticateMiddleware([{"jwt":["project:update"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProjectController)),
            ...(fetchMiddlewares<RequestHandler>(ProjectController.prototype.updateProject)),

            async function ProjectController_updateProject(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProjectController_updateProject, request, response });

                const controller = new ProjectController();

              await templateService.apiHandler({
                methodName: 'updateProject',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsProjectController_deleteProject: Record<string, TsoaRoute.ParameterSchema> = {
                projectId: {"in":"path","name":"projectId","required":true,"dataType":"string"},
        };
        app.delete('/api/projects/:projectId',
            authenticateMiddleware([{"jwt":["project:delete"]}]),
            ...(fetchMiddlewares<RequestHandler>(ProjectController)),
            ...(fetchMiddlewares<RequestHandler>(ProjectController.prototype.deleteProject)),

            async function ProjectController_deleteProject(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsProjectController_deleteProject, request, response });

                const controller = new ProjectController();

              await templateService.apiHandler({
                methodName: 'deleteProject',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPermissionsController_listPermissions: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/permissions',
            ...(fetchMiddlewares<RequestHandler>(PermissionsController)),
            ...(fetchMiddlewares<RequestHandler>(PermissionsController.prototype.listPermissions)),

            async function PermissionsController_listPermissions(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPermissionsController_listPermissions, request, response });

                const controller = new PermissionsController();

              await templateService.apiHandler({
                methodName: 'listPermissions',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPermissionsController_getPermission: Record<string, TsoaRoute.ParameterSchema> = {
                permissionId: {"in":"path","name":"permissionId","required":true,"dataType":"string"},
        };
        app.get('/api/permissions/:permissionId',
            authenticateMiddleware([{"jwt":["permission:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(PermissionsController)),
            ...(fetchMiddlewares<RequestHandler>(PermissionsController.prototype.getPermission)),

            async function PermissionsController_getPermission(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPermissionsController_getPermission, request, response });

                const controller = new PermissionsController();

              await templateService.apiHandler({
                methodName: 'getPermission',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPermissionsController_createPermission: Record<string, TsoaRoute.ParameterSchema> = {
                data: {"in":"body","name":"data","required":true,"ref":"PermissionCreateRequest"},
        };
        app.post('/api/permissions',
            authenticateMiddleware([{"jwt":["permission:create"]}]),
            ...(fetchMiddlewares<RequestHandler>(PermissionsController)),
            ...(fetchMiddlewares<RequestHandler>(PermissionsController.prototype.createPermission)),

            async function PermissionsController_createPermission(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPermissionsController_createPermission, request, response });

                const controller = new PermissionsController();

              await templateService.apiHandler({
                methodName: 'createPermission',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPermissionsController_updatePermission: Record<string, TsoaRoute.ParameterSchema> = {
                permissionId: {"in":"path","name":"permissionId","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"ref":"PermissionUpdateRequest"},
        };
        app.put('/api/permissions/:permissionId',
            authenticateMiddleware([{"jwt":["permission:update"]}]),
            ...(fetchMiddlewares<RequestHandler>(PermissionsController)),
            ...(fetchMiddlewares<RequestHandler>(PermissionsController.prototype.updatePermission)),

            async function PermissionsController_updatePermission(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPermissionsController_updatePermission, request, response });

                const controller = new PermissionsController();

              await templateService.apiHandler({
                methodName: 'updatePermission',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPermissionsController_deletePermission: Record<string, TsoaRoute.ParameterSchema> = {
                permissionId: {"in":"path","name":"permissionId","required":true,"dataType":"string"},
        };
        app.delete('/api/permissions/:permissionId',
            authenticateMiddleware([{"jwt":["permission:delete"]}]),
            ...(fetchMiddlewares<RequestHandler>(PermissionsController)),
            ...(fetchMiddlewares<RequestHandler>(PermissionsController.prototype.deletePermission)),

            async function PermissionsController_deletePermission(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPermissionsController_deletePermission, request, response });

                const controller = new PermissionsController();

              await templateService.apiHandler({
                methodName: 'deletePermission',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrganizationController_getOrganizations: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                type: {"in":"query","name":"type","dataType":"union","subSchemas":[{"dataType":"enum","enums":["stakeholder"]},{"dataType":"enum","enums":["system_owner"]}]},
                status: {"in":"query","name":"status","dataType":"union","subSchemas":[{"dataType":"enum","enums":["active"]},{"dataType":"enum","enums":["suspended"]},{"dataType":"enum","enums":["deleted"]}]},
                search: {"in":"query","name":"search","dataType":"string"},
        };
        app.get('/api/organizations',
            authenticateMiddleware([{"jwt":["project:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(OrganizationController)),
            ...(fetchMiddlewares<RequestHandler>(OrganizationController.prototype.getOrganizations)),

            async function OrganizationController_getOrganizations(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrganizationController_getOrganizations, request, response });

                const controller = new OrganizationController();

              await templateService.apiHandler({
                methodName: 'getOrganizations',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrganizationController_getOrganizationById: Record<string, TsoaRoute.ParameterSchema> = {
                organizationId: {"in":"path","name":"organizationId","required":true,"dataType":"string"},
        };
        app.get('/api/organizations/:organizationId',
            authenticateMiddleware([{"jwt":["project:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(OrganizationController)),
            ...(fetchMiddlewares<RequestHandler>(OrganizationController.prototype.getOrganizationById)),

            async function OrganizationController_getOrganizationById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrganizationController_getOrganizationById, request, response });

                const controller = new OrganizationController();

              await templateService.apiHandler({
                methodName: 'getOrganizationById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrganizationController_createOrganization: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                data: {"in":"body","name":"data","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"permissionIds":{"dataType":"array","array":{"dataType":"string"}},"ownerEmail":{"dataType":"string","required":true},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["stakeholder"]},{"dataType":"enum","enums":["system_owner"]}]},"logo":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"description":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"name":{"dataType":"string","required":true}}},
        };
        app.post('/api/organizations',
            authenticateMiddleware([{"jwt":["project:create"]}]),
            ...(fetchMiddlewares<RequestHandler>(OrganizationController)),
            ...(fetchMiddlewares<RequestHandler>(OrganizationController.prototype.createOrganization)),

            async function OrganizationController_createOrganization(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrganizationController_createOrganization, request, response });

                const controller = new OrganizationController();

              await templateService.apiHandler({
                methodName: 'createOrganization',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrganizationController_updateOrganization: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                organizationId: {"in":"path","name":"organizationId","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"status":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["active"]},{"dataType":"enum","enums":["suspended"]},{"dataType":"enum","enums":["deleted"]}]},"permissionIds":{"dataType":"array","array":{"dataType":"string"}},"ownerId":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"type":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["stakeholder"]},{"dataType":"enum","enums":["system_owner"]}]},"logo":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"description":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"name":{"dataType":"string"}}},
        };
        app.put('/api/organizations/:organizationId',
            authenticateMiddleware([{"jwt":["project:update"]}]),
            ...(fetchMiddlewares<RequestHandler>(OrganizationController)),
            ...(fetchMiddlewares<RequestHandler>(OrganizationController.prototype.updateOrganization)),

            async function OrganizationController_updateOrganization(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrganizationController_updateOrganization, request, response });

                const controller = new OrganizationController();

              await templateService.apiHandler({
                methodName: 'updateOrganization',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrganizationController_deleteOrganization: Record<string, TsoaRoute.ParameterSchema> = {
                organizationId: {"in":"path","name":"organizationId","required":true,"dataType":"string"},
        };
        app.delete('/api/organizations/:organizationId',
            authenticateMiddleware([{"jwt":["project:delete"]}]),
            ...(fetchMiddlewares<RequestHandler>(OrganizationController)),
            ...(fetchMiddlewares<RequestHandler>(OrganizationController.prototype.deleteOrganization)),

            async function OrganizationController_deleteOrganization(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrganizationController_deleteOrganization, request, response });

                const controller = new OrganizationController();

              await templateService.apiHandler({
                methodName: 'deleteOrganization',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrganizationController_getOrganizationUsers: Record<string, TsoaRoute.ParameterSchema> = {
                organizationId: {"in":"path","name":"organizationId","required":true,"dataType":"string"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":50,"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/api/organizations/:organizationId/users',
            authenticateMiddleware([{"jwt":["project:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(OrganizationController)),
            ...(fetchMiddlewares<RequestHandler>(OrganizationController.prototype.getOrganizationUsers)),

            async function OrganizationController_getOrganizationUsers(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrganizationController_getOrganizationUsers, request, response });

                const controller = new OrganizationController();

              await templateService.apiHandler({
                methodName: 'getOrganizationUsers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsOrganizationVerificationController_verifyInvite: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"phone":{"dataType":"string","required":true},"password":{"dataType":"string","required":true},"email":{"dataType":"string","required":true},"name":{"dataType":"string","required":true},"token":{"dataType":"string","required":true}}},
        };
        app.post('/api/organizations/verify-invite',
            ...(fetchMiddlewares<RequestHandler>(OrganizationVerificationController)),
            ...(fetchMiddlewares<RequestHandler>(OrganizationVerificationController.prototype.verifyInvite)),

            async function OrganizationVerificationController_verifyInvite(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsOrganizationVerificationController_verifyInvite, request, response });

                const controller = new OrganizationVerificationController();

              await templateService.apiHandler({
                methodName: 'verifyInvite',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_getNotifications: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                type: {"in":"query","name":"type","dataType":"union","subSchemas":[{"dataType":"enum","enums":["survey"]},{"dataType":"enum","enums":["feedback"]},{"dataType":"enum","enums":["community_session"]},{"dataType":"enum","enums":["system"]}]},
                isRead: {"in":"query","name":"isRead","dataType":"boolean"},
                startDate: {"in":"query","name":"startDate","dataType":"string"},
                endDate: {"in":"query","name":"endDate","dataType":"string"},
        };
        app.get('/api/notifications',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.getNotifications)),

            async function NotificationController_getNotifications(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_getNotifications, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'getNotifications',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_getUnreadCount: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/notifications/unread-count',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.getUnreadCount)),

            async function NotificationController_getUnreadCount(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_getUnreadCount, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'getUnreadCount',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_getNotificationById: Record<string, TsoaRoute.ParameterSchema> = {
                notificationId: {"in":"path","name":"notificationId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.get('/api/notifications/:notificationId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.getNotificationById)),

            async function NotificationController_getNotificationById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_getNotificationById, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'getNotificationById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_createNotification: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                data: {"in":"body","name":"data","required":true,"ref":"NotificationCreateRequest"},
        };
        app.post('/api/notifications',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.createNotification)),

            async function NotificationController_createNotification(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_createNotification, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'createNotification',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_updateNotification: Record<string, TsoaRoute.ParameterSchema> = {
                notificationId: {"in":"path","name":"notificationId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                data: {"in":"body","name":"data","required":true,"ref":"NotificationUpdateRequest"},
        };
        app.put('/api/notifications/:notificationId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.updateNotification)),

            async function NotificationController_updateNotification(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_updateNotification, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'updateNotification',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_markAllAsRead: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.put('/api/notifications/mark-all-read',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.markAllAsRead)),

            async function NotificationController_markAllAsRead(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_markAllAsRead, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'markAllAsRead',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_deleteNotification: Record<string, TsoaRoute.ParameterSchema> = {
                notificationId: {"in":"path","name":"notificationId","required":true,"dataType":"string"},
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.delete('/api/notifications/:notificationId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.deleteNotification)),

            async function NotificationController_deleteNotification(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_deleteNotification, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'deleteNotification',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_clearReadNotifications: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
        };
        app.delete('/api/notifications/clear-read',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.clearReadNotifications)),

            async function NotificationController_clearReadNotifications(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_clearReadNotifications, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'clearReadNotifications',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFeedbackController_getFeedback: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                status: {"in":"query","name":"status","dataType":"union","subSchemas":[{"dataType":"enum","enums":["submitted"]},{"dataType":"enum","enums":["Acknowledged"]},{"dataType":"enum","enums":["Resolved"]},{"dataType":"enum","enums":["Rejected"]}]},
                feedbackType: {"in":"query","name":"feedbackType","dataType":"union","subSchemas":[{"dataType":"enum","enums":["positive"]},{"dataType":"enum","enums":["negative"]},{"dataType":"enum","enums":["suggestion"]},{"dataType":"enum","enums":["concern"]}]},
                projectId: {"in":"query","name":"projectId","dataType":"string"},
                owner: {"in":"query","name":"owner","dataType":"union","subSchemas":[{"dataType":"enum","enums":["me"]},{"dataType":"enum","enums":["other"]}]},
                org: {"in":"query","name":"org","dataType":"union","subSchemas":[{"dataType":"enum","enums":["mine"]},{"dataType":"enum","enums":["others"]},{"dataType":"enum","enums":["all"]}]},
                startDate: {"in":"query","name":"startDate","dataType":"string"},
                endDate: {"in":"query","name":"endDate","dataType":"string"},
                search: {"in":"query","name":"search","dataType":"string"},
        };
        app.get('/api/feedback',
            authenticateMiddleware([{"jwt":["feedback:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController)),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController.prototype.getFeedback)),

            async function FeedbackController_getFeedback(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeedbackController_getFeedback, request, response });

                const controller = new FeedbackController();

              await templateService.apiHandler({
                methodName: 'getFeedback',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFeedbackController_getFeedbackById: Record<string, TsoaRoute.ParameterSchema> = {
                feedbackId: {"in":"path","name":"feedbackId","required":true,"dataType":"string"},
        };
        app.get('/api/feedback/:feedbackId',
            authenticateMiddleware([{"jwt":["feedback:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController)),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController.prototype.getFeedbackById)),

            async function FeedbackController_getFeedbackById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeedbackController_getFeedbackById, request, response });

                const controller = new FeedbackController();

              await templateService.apiHandler({
                methodName: 'getFeedbackById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFeedbackController_createFeedback: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                data: {"in":"body","name":"data","required":true,"ref":"FeedbackCreateRequest"},
        };
        app.post('/api/feedback',
            authenticateMiddleware([{"optionalJwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController)),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController.prototype.createFeedback)),

            async function FeedbackController_createFeedback(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeedbackController_createFeedback, request, response });

                const controller = new FeedbackController();

              await templateService.apiHandler({
                methodName: 'createFeedback',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFeedbackController_getFeedbackReplies: Record<string, TsoaRoute.ParameterSchema> = {
                feedbackId: {"in":"path","name":"feedbackId","required":true,"dataType":"string"},
        };
        app.get('/api/feedback/:feedbackId/replies',
            authenticateMiddleware([{"jwt":["feedback:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController)),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController.prototype.getFeedbackReplies)),

            async function FeedbackController_getFeedbackReplies(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeedbackController_getFeedbackReplies, request, response });

                const controller = new FeedbackController();

              await templateService.apiHandler({
                methodName: 'getFeedbackReplies',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFeedbackController_addFeedbackReply: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                feedbackId: {"in":"path","name":"feedbackId","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"ref":"FeedbackReplyCreateRequest"},
        };
        app.post('/api/feedback/:feedbackId/replies',
            authenticateMiddleware([{"jwt":["feedback:update"]}]),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController)),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController.prototype.addFeedbackReply)),

            async function FeedbackController_addFeedbackReply(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeedbackController_addFeedbackReply, request, response });

                const controller = new FeedbackController();

              await templateService.apiHandler({
                methodName: 'addFeedbackReply',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFeedbackController_updateFeedback: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                feedbackId: {"in":"path","name":"feedbackId","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"ref":"FeedbackUpdateRequest"},
        };
        app.put('/api/feedback/:feedbackId',
            authenticateMiddleware([{"jwt":["feedback:update"]}]),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController)),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController.prototype.updateFeedback)),

            async function FeedbackController_updateFeedback(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeedbackController_updateFeedback, request, response });

                const controller = new FeedbackController();

              await templateService.apiHandler({
                methodName: 'updateFeedback',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFeedbackController_deleteFeedback: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                feedbackId: {"in":"path","name":"feedbackId","required":true,"dataType":"string"},
        };
        app.delete('/api/feedback/:feedbackId',
            authenticateMiddleware([{"jwt":["feedback:delete"]}]),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController)),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController.prototype.deleteFeedback)),

            async function FeedbackController_deleteFeedback(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeedbackController_deleteFeedback, request, response });

                const controller = new FeedbackController();

              await templateService.apiHandler({
                methodName: 'deleteFeedback',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsFeedbackController_getFeedbackStats: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/api/feedback/stats/summary',
            authenticateMiddleware([{"jwt":["feedback:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController)),
            ...(fetchMiddlewares<RequestHandler>(FeedbackController.prototype.getFeedbackStats)),

            async function FeedbackController_getFeedbackStats(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsFeedbackController_getFeedbackStats, request, response });

                const controller = new FeedbackController();

              await templateService.apiHandler({
                methodName: 'getFeedbackStats',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDocumentController_getDocuments: Record<string, TsoaRoute.ParameterSchema> = {
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                projectId: {"in":"query","name":"projectId","dataType":"string"},
                userId: {"in":"query","name":"userId","dataType":"string"},
        };
        app.get('/api/documents',
            authenticateMiddleware([{"jwt":["project:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.getDocuments)),

            async function DocumentController_getDocuments(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDocumentController_getDocuments, request, response });

                const controller = new DocumentController();

              await templateService.apiHandler({
                methodName: 'getDocuments',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDocumentController_getDocumentById: Record<string, TsoaRoute.ParameterSchema> = {
                documentId: {"in":"path","name":"documentId","required":true,"dataType":"string"},
        };
        app.get('/api/documents/:documentId',
            authenticateMiddleware([{"jwt":["project:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.getDocumentById)),

            async function DocumentController_getDocumentById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDocumentController_getDocumentById, request, response });

                const controller = new DocumentController();

              await templateService.apiHandler({
                methodName: 'getDocumentById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDocumentController_createDocument: Record<string, TsoaRoute.ParameterSchema> = {
                data: {"in":"body","name":"data","required":true,"ref":"DocumentCreateRequest"},
        };
        app.post('/api/documents',
            authenticateMiddleware([{"jwt":["project:create"]}]),
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.createDocument)),

            async function DocumentController_createDocument(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDocumentController_createDocument, request, response });

                const controller = new DocumentController();

              await templateService.apiHandler({
                methodName: 'createDocument',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDocumentController_updateDocument: Record<string, TsoaRoute.ParameterSchema> = {
                documentId: {"in":"path","name":"documentId","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"ref":"DocumentUpdateRequest"},
        };
        app.put('/api/documents/:documentId',
            authenticateMiddleware([{"jwt":["project:update"]}]),
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.updateDocument)),

            async function DocumentController_updateDocument(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDocumentController_updateDocument, request, response });

                const controller = new DocumentController();

              await templateService.apiHandler({
                methodName: 'updateDocument',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsDocumentController_deleteDocument: Record<string, TsoaRoute.ParameterSchema> = {
                documentId: {"in":"path","name":"documentId","required":true,"dataType":"string"},
        };
        app.delete('/api/documents/:documentId',
            authenticateMiddleware([{"jwt":["project:delete"]}]),
            ...(fetchMiddlewares<RequestHandler>(DocumentController)),
            ...(fetchMiddlewares<RequestHandler>(DocumentController.prototype.deleteDocument)),

            async function DocumentController_deleteDocument(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsDocumentController_deleteDocument, request, response });

                const controller = new DocumentController();

              await templateService.apiHandler({
                methodName: 'deleteDocument',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCommunitySessionController_getCommunitySessions: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"request","name":"request","required":true,"dataType":"object"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                type: {"in":"query","name":"type","dataType":"union","subSchemas":[{"dataType":"enum","enums":["video"]},{"dataType":"enum","enums":["image"]},{"dataType":"enum","enums":["document"]},{"dataType":"enum","enums":["audio"]}]},
                isActive: {"in":"query","name":"isActive","dataType":"boolean"},
                allowed: {"in":"query","name":"allowed","dataType":"boolean"},
                search: {"in":"query","name":"search","dataType":"string"},
        };
        app.get('/api/community-sessions',
            authenticateMiddleware([{"jwt":["community_session:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController)),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController.prototype.getCommunitySessions)),

            async function CommunitySessionController_getCommunitySessions(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCommunitySessionController_getCommunitySessions, request, response });

                const controller = new CommunitySessionController();

              await templateService.apiHandler({
                methodName: 'getCommunitySessions',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCommunitySessionController_getCommunitySessionById: Record<string, TsoaRoute.ParameterSchema> = {
                sessionId: {"in":"path","name":"sessionId","required":true,"dataType":"string"},
        };
        app.get('/api/community-sessions/:sessionId',
            authenticateMiddleware([{"jwt":["community_session:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController)),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController.prototype.getCommunitySessionById)),

            async function CommunitySessionController_getCommunitySessionById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCommunitySessionController_getCommunitySessionById, request, response });

                const controller = new CommunitySessionController();

              await templateService.apiHandler({
                methodName: 'getCommunitySessionById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCommunitySessionController_createCommunitySession: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                data: {"in":"body","name":"data","required":true,"ref":"CommunitySessionCreateRequest"},
        };
        app.post('/api/community-sessions',
            authenticateMiddleware([{"jwt":["community_session:create"]}]),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController)),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController.prototype.createCommunitySession)),

            async function CommunitySessionController_createCommunitySession(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCommunitySessionController_createCommunitySession, request, response });

                const controller = new CommunitySessionController();

              await templateService.apiHandler({
                methodName: 'createCommunitySession',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCommunitySessionController_updateCommunitySession: Record<string, TsoaRoute.ParameterSchema> = {
                sessionId: {"in":"path","name":"sessionId","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"ref":"CommunitySessionUpdateRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.put('/api/community-sessions/:sessionId',
            authenticateMiddleware([{"jwt":["community_session:update"]}]),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController)),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController.prototype.updateCommunitySession)),

            async function CommunitySessionController_updateCommunitySession(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCommunitySessionController_updateCommunitySession, request, response });

                const controller = new CommunitySessionController();

              await templateService.apiHandler({
                methodName: 'updateCommunitySession',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCommunitySessionController_deleteCommunitySession: Record<string, TsoaRoute.ParameterSchema> = {
                sessionId: {"in":"path","name":"sessionId","required":true,"dataType":"string"},
        };
        app.delete('/api/community-sessions/:sessionId',
            authenticateMiddleware([{"jwt":["community_session:delete"]}]),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController)),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController.prototype.deleteCommunitySession)),

            async function CommunitySessionController_deleteCommunitySession(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCommunitySessionController_deleteCommunitySession, request, response });

                const controller = new CommunitySessionController();

              await templateService.apiHandler({
                methodName: 'deleteCommunitySession',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCommunitySessionController_getSessionComments: Record<string, TsoaRoute.ParameterSchema> = {
                sessionId: {"in":"path","name":"sessionId","required":true,"dataType":"string"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":50,"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/api/community-sessions/:sessionId/comments',
            authenticateMiddleware([{"jwt":["community_session:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController)),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController.prototype.getSessionComments)),

            async function CommunitySessionController_getSessionComments(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCommunitySessionController_getSessionComments, request, response });

                const controller = new CommunitySessionController();

              await templateService.apiHandler({
                methodName: 'getSessionComments',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCommunitySessionController_addComment: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                sessionId: {"in":"path","name":"sessionId","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"ref":"CommentCreateRequest"},
        };
        app.post('/api/community-sessions/:sessionId/comments',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController)),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController.prototype.addComment)),

            async function CommunitySessionController_addComment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCommunitySessionController_addComment, request, response });

                const controller = new CommunitySessionController();

              await templateService.apiHandler({
                methodName: 'addComment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCommunitySessionController_updateComment: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                commentId: {"in":"path","name":"commentId","required":true,"dataType":"string"},
                data: {"in":"body","name":"data","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"content":{"dataType":"string","required":true}}},
        };
        app.put('/api/community-sessions/comments/:commentId',
            authenticateMiddleware([{"jwt":["comment:update"]}]),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController)),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController.prototype.updateComment)),

            async function CommunitySessionController_updateComment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCommunitySessionController_updateComment, request, response });

                const controller = new CommunitySessionController();

              await templateService.apiHandler({
                methodName: 'updateComment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCommunitySessionController_deleteComment: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                commentId: {"in":"path","name":"commentId","required":true,"dataType":"string"},
        };
        app.delete('/api/community-sessions/comments/:commentId',
            authenticateMiddleware([{"jwt":["comment:delete"]}]),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController)),
            ...(fetchMiddlewares<RequestHandler>(CommunitySessionController.prototype.deleteComment)),

            async function CommunitySessionController_deleteComment(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCommunitySessionController_deleteComment, request, response });

                const controller = new CommunitySessionController();

              await templateService.apiHandler({
                methodName: 'deleteComment',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_login: Record<string, TsoaRoute.ParameterSchema> = {
                credentials: {"in":"body","name":"credentials","required":true,"ref":"LoginRequest"},
                res: {"in":"res","name":"403","required":true,"ref":"ServiceResponse__user-IUserResponse-or-null__"},
        };
        app.post('/api/auth/login',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.login)),

            async function AuthController_login(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_login, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_signup: Record<string, TsoaRoute.ParameterSchema> = {
                signupData: {"in":"body","name":"signupData","required":true,"ref":"SignupRequest"},
                res: {"in":"res","name":"400","required":true,"ref":"ServiceResponse__user-IUserResponse-or-null__"},
        };
        app.post('/api/auth/signup',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.signup)),

            async function AuthController_signup(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_signup, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'signup',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_forgotPassword: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","required":true,"ref":"ForgotPasswordRequest"},
        };
        app.post('/api/auth/forgot-password',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.forgotPassword)),

            async function AuthController_forgotPassword(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_forgotPassword, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'forgotPassword',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_resetPassword: Record<string, TsoaRoute.ParameterSchema> = {
                request: {"in":"body","name":"request","required":true,"ref":"ResetPasswordRequest"},
        };
        app.post('/api/auth/reset-password',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.resetPassword)),

            async function AuthController_resetPassword(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_resetPassword, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'resetPassword',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_googleAuth: Record<string, TsoaRoute.ParameterSchema> = {
                res: {"in":"res","name":"302","required":true,"dataType":"void"},
        };
        app.get('/api/auth/google',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.googleAuth)),

            async function AuthController_googleAuth(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_googleAuth, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'googleAuth',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 302,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_googleAuthCallback: Record<string, TsoaRoute.ParameterSchema> = {
                res: {"in":"res","name":"302","required":true,"dataType":"void"},
                code: {"in":"query","name":"code","required":true,"dataType":"string"},
                error: {"in":"query","name":"error","dataType":"string"},
        };
        app.get('/api/auth/google/callback',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.googleAuthCallback)),

            async function AuthController_googleAuthCallback(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_googleAuthCallback, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'googleAuthCallback',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 302,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_getCurrentUser: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                res: {"in":"res","name":"401","required":true,"ref":"ServiceResponse__user-IUserResponse-or-null__"},
        };
        app.get('/api/auth/me',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.getCurrentUser)),

            async function AuthController_getCurrentUser(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_getCurrentUser, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'getCurrentUser',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_logout: Record<string, TsoaRoute.ParameterSchema> = {
                res: {"in":"res","name":"200","required":true,"ref":"ServiceResponse__success-boolean__"},
        };
        app.post('/api/auth/logout',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.logout)),

            async function AuthController_logout(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_logout, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'logout',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_organizationSignup: Record<string, TsoaRoute.ParameterSchema> = {
                data: {"in":"body","name":"data","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"phone":{"dataType":"string","required":true},"password":{"dataType":"string","required":true},"name":{"dataType":"string","required":true},"organizationId":{"dataType":"string","required":true},"token":{"dataType":"string","required":true}}},
                res: {"in":"res","name":"400","required":true,"ref":"ServiceResponse_any_"},
        };
        app.post('/api/auth/organization-signup',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.organizationSignup)),

            async function AuthController_organizationSignup(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_organizationSignup, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'organizationSignup',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_changePassword: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"ChangePasswordRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                res: {"in":"res","name":"401","required":true,"ref":"ServiceResponse_null_"},
        };
        app.post('/api/auth/change-password',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.changePassword)),

            async function AuthController_changePassword(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_changePassword, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'changePassword',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAnnouncementController_listAnnouncements: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                limit: {"default":25,"in":"query","name":"limit","dataType":"double"},
                status: {"in":"query","name":"status","dataType":"union","subSchemas":[{"dataType":"enum","enums":["draft"]},{"dataType":"enum","enums":["scheduled"]},{"dataType":"enum","enums":["sent"]},{"dataType":"enum","enums":["stopped"]}]},
                q: {"in":"query","name":"q","dataType":"string"},
                startDate: {"in":"query","name":"startDate","dataType":"string"},
                endDate: {"in":"query","name":"endDate","dataType":"string"},
                allowed: {"in":"query","name":"allowed","dataType":"boolean"},
        };
        app.get('/api/announcements',
            authenticateMiddleware([{"jwt":["project:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(AnnouncementController)),
            ...(fetchMiddlewares<RequestHandler>(AnnouncementController.prototype.listAnnouncements)),

            async function AnnouncementController_listAnnouncements(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAnnouncementController_listAnnouncements, request, response });

                const controller = new AnnouncementController();

              await templateService.apiHandler({
                methodName: 'listAnnouncements',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAnnouncementController_getAnnouncement: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/api/announcements/:id',
            authenticateMiddleware([{"jwt":["project:read"]}]),
            ...(fetchMiddlewares<RequestHandler>(AnnouncementController)),
            ...(fetchMiddlewares<RequestHandler>(AnnouncementController.prototype.getAnnouncement)),

            async function AnnouncementController_getAnnouncement(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAnnouncementController_getAnnouncement, request, response });

                const controller = new AnnouncementController();

              await templateService.apiHandler({
                methodName: 'getAnnouncement',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAnnouncementController_createAnnouncement: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"allowedRoles":{"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"string"}},{"dataType":"enum","enums":[null]}]},"viewDetailsLink":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"scheduledAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"status":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["draft"]},{"dataType":"enum","enums":["scheduled"]},{"dataType":"enum","enums":["sent"]}]},"message":{"dataType":"string","required":true},"title":{"dataType":"string","required":true}}},
        };
        app.post('/api/announcements',
            authenticateMiddleware([{"jwt":["announcement:create"]}]),
            ...(fetchMiddlewares<RequestHandler>(AnnouncementController)),
            ...(fetchMiddlewares<RequestHandler>(AnnouncementController.prototype.createAnnouncement)),

            async function AnnouncementController_createAnnouncement(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAnnouncementController_createAnnouncement, request, response });

                const controller = new AnnouncementController();

              await templateService.apiHandler({
                methodName: 'createAnnouncement',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAnnouncementController_updateAnnouncement: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"allowedRoles":{"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"string"}},{"dataType":"enum","enums":[null]}]},"viewDetailsLink":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"scheduledAt":{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},"status":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["draft"]},{"dataType":"enum","enums":["scheduled"]},{"dataType":"enum","enums":["sent"]},{"dataType":"enum","enums":["stopped"]}]},"message":{"dataType":"string"},"title":{"dataType":"string"}}},
        };
        app.put('/api/announcements/:id',
            authenticateMiddleware([{"jwt":["project:update"]}]),
            ...(fetchMiddlewares<RequestHandler>(AnnouncementController)),
            ...(fetchMiddlewares<RequestHandler>(AnnouncementController.prototype.updateAnnouncement)),

            async function AnnouncementController_updateAnnouncement(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAnnouncementController_updateAnnouncement, request, response });

                const controller = new AnnouncementController();

              await templateService.apiHandler({
                methodName: 'updateAnnouncement',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAnnouncementController_deleteAnnouncement: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","dataType":"object"},
        };
        app.delete('/api/announcements/:id',
            authenticateMiddleware([{"jwt":["project:delete"]}]),
            ...(fetchMiddlewares<RequestHandler>(AnnouncementController)),
            ...(fetchMiddlewares<RequestHandler>(AnnouncementController.prototype.deleteAnnouncement)),

            async function AnnouncementController_deleteAnnouncement(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAnnouncementController_deleteAnnouncement, request, response });

                const controller = new AnnouncementController();

              await templateService.apiHandler({
                methodName: 'deleteAnnouncement',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, response: any, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }

                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            try {
                request['user'] = await Promise.any(secMethodOrPromises);

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }

                next();
            }
            catch(err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
