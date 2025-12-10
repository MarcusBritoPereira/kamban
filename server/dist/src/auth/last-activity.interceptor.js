"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LastActivityInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const users_service_1 = require("../users/users.service");
let LastActivityInterceptor = class LastActivityInterceptor {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.tap)(() => {
            const request = context.switchToHttp().getRequest();
            const user = request.user;
            if (user && user.sub) {
                this.usersService
                    .updateLastActivity(user.sub)
                    .catch((err) => console.error('Error updating last activity', err));
            }
        }));
    }
};
exports.LastActivityInterceptor = LastActivityInterceptor;
exports.LastActivityInterceptor = LastActivityInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], LastActivityInterceptor);
//# sourceMappingURL=last-activity.interceptor.js.map