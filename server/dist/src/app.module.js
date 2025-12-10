"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const prisma_module_1 = require("./prisma/prisma.module");
const spaces_module_1 = require("./spaces/spaces.module");
const folders_module_1 = require("./folders/folders.module");
const lists_module_1 = require("./lists/lists.module");
const tasks_module_1 = require("./tasks/tasks.module");
const attachments_module_1 = require("./attachments/attachments.module");
const permissions_module_1 = require("./permissions/permissions.module");
const users_module_1 = require("./users/users.module");
const core_1 = require("@nestjs/core");
const last_activity_interceptor_1 = require("./auth/last-activity.interceptor");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            prisma_module_1.PrismaModule,
            spaces_module_1.SpacesModule,
            folders_module_1.FoldersModule,
            lists_module_1.ListsModule,
            tasks_module_1.TasksModule,
            attachments_module_1.AttachmentsModule,
            permissions_module_1.PermissionsModule,
            users_module_1.UsersModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: last_activity_interceptor_1.LastActivityInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map