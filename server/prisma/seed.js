"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const MODEL_KEY_OVERRIDES = {
    users: "user",
};
function clearData() {
    return __awaiter(this, void 0, void 0, function* () {
        yield prisma.auditLog.deleteMany({});
        yield prisma.session.deleteMany({});
        yield prisma.twoFactorToken.deleteMany({});
        yield prisma.sales.deleteMany({});
        yield prisma.purchases.deleteMany({});
        yield prisma.products.deleteMany({});
        yield prisma.customers.deleteMany({});
        yield prisma.salesSummary.deleteMany({});
        yield prisma.inventorySummary.deleteMany({});
        yield prisma.customerSummary.deleteMany({});
        yield prisma.user.deleteMany({});
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const dataDirectory = path_1.default.join(__dirname, "seedData");
        const orderedFileNames = [
            "users.json",
            "products.json", // parent
            "customers.json", // parent
            "purchases.json", // child (related to products)
            "sales.json", // child (related to products & customers)
            "inventorySummary.json", // summary
            "salesSummary.json", // summary
            "customerSummary.json",
        ];
        yield clearData();
        for (const fileName of orderedFileNames) {
            const filePath = path_1.default.join(dataDirectory, fileName);
            const jsonData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
            const baseName = path_1.default.basename(fileName, path_1.default.extname(fileName));
            const modelKey = ((_a = MODEL_KEY_OVERRIDES[baseName]) !== null && _a !== void 0 ? _a : baseName);
            const model = prisma[modelKey];
            if (!model) {
                console.error(`No Prisma model matches the file name: ${fileName}`);
                continue;
            }
            for (const rawData of jsonData) {
                if (baseName === "users") {
                    const _b = rawData, { password } = _b, rest = __rest(_b, ["password"]);
                    const passwordHash = yield bcryptjs_1.default.hash(password, 10);
                    yield prisma.user.create({
                        data: Object.assign(Object.assign({}, rest), { passwordHash }),
                    });
                    continue;
                }
                yield model.create({
                    data: rawData,
                });
            }
            console.log(`Seeded ${baseName} with data from ${fileName}`);
        }
    });
}
main()
    .catch((e) => {
    console.error(e);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
