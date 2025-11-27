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
const dataController = __importStar(require("../../controllers/admin/dataController"));
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = express_1.default.Router();
// All data routes require admin authentication
router.get('/stats', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, dataController.getDatabaseStats);
router.get('/users', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, dataController.getAllUsers);
router.get('/tables', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, dataController.getDatabaseTables);
router.get('/tables/:table_name/schema', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, dataController.getTableSchema);
router.get('/tables/:table_name/data', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, dataController.getTableData);
router.post('/query', authMiddleware_1.verifyToken, authMiddleware_1.adminAuth, dataController.executeQuery);
exports.default = router;
//# sourceMappingURL=data.js.map