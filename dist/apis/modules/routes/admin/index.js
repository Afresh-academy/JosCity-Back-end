"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Import admin route modules
const auth_1 = __importDefault(require("./auth"));
const dashboard_1 = __importDefault(require("./dashboard"));
const users_1 = __importDefault(require("./users"));
const posts_1 = __importDefault(require("./posts"));
const settings_1 = __importDefault(require("./settings"));
const landingPage_1 = __importDefault(require("./landingPage"));
const data_1 = __importDefault(require("./data"));
const router = express_1.default.Router();
// Mount admin routes
router.use("/auth", auth_1.default);
router.use("/dashboard", dashboard_1.default);
router.use("/users", users_1.default);
router.use("/posts", posts_1.default);
router.use("/settings", settings_1.default);
router.use("/landing-page", landingPage_1.default);
router.use("/data", data_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map