"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController = __importStar(require("../controllers/authController"));
const router = express_1.default.Router();
// Public routes
router.post('/signup', authController.signUp);
router.post('/signin', authController.signIn);
router.post('/signout', authController.signOut);
// Registration routes (wrappers for signup with account_type)
router.post('/personal/register', authController.personalRegister);
router.post('/business/register', authController.businessRegister);
// Password reset routes
router.post('/forget_password', authController.forgetPassword);
router.post('/forget_password_confirm', authController.forgetPasswordConfirm);
router.post('/forget_password_reset', authController.forgetPasswordReset);
// Activation routes
router.post('/resend_activation', authController.resendActivation);
// Admin routes
router.get('/admin/pending', authController.getPendingApprovals);
router.post('/admin/approve', authController.approveAccount);
router.post('/admin/reject', authController.rejectAccount);
exports.default = router;
//# sourceMappingURL=authRoute.js.map