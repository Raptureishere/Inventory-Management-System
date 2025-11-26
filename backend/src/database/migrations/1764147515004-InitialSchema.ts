import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1764147515004 implements MigrationInterface {
    name = 'InitialSchema1764147515004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "purchase_order_items" ("id" SERIAL NOT NULL, "purchaseOrderId" integer NOT NULL, "itemId" integer NOT NULL, "itemName" character varying(200) NOT NULL, "orderedQty" integer NOT NULL, "receivedQty" integer NOT NULL DEFAULT '0', "unitPrice" numeric(10,2) NOT NULL, "totalPrice" numeric(10,2) NOT NULL, CONSTRAINT "PK_e8b7568d25c41e3290db596b312" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."purchase_orders_status_enum" AS ENUM('pending', 'received', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "purchase_orders" ("id" SERIAL NOT NULL, "poNumber" character varying(50) NOT NULL, "supplierId" integer NOT NULL, "orderDate" date NOT NULL, "expectedDeliveryDate" date NOT NULL, "actualDeliveryDate" date, "status" "public"."purchase_orders_status_enum" NOT NULL DEFAULT 'pending', "totalAmount" numeric(10,2) NOT NULL DEFAULT '0', "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2e0fc7a6605393a9bd691cdcebe" UNIQUE ("poNumber"), CONSTRAINT "PK_05148947415204a897e8beb2553" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "suppliers" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "contactPerson" character varying(100), "email" character varying(100), "phone" character varying(20), "address" text, "notes" text, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."issuing_vouchers_status_enum" AS ENUM('pending', 'partially_provided', 'fully_provided')`);
        await queryRunner.query(`CREATE TABLE "issuing_vouchers" ("id" SERIAL NOT NULL, "voucherId" character varying(50) NOT NULL, "requisitionId" integer NOT NULL, "issueDate" date NOT NULL, "status" "public"."issuing_vouchers_status_enum" NOT NULL DEFAULT 'pending', "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_afc5f6f913e6d46ce8d3f9afc6f" UNIQUE ("voucherId"), CONSTRAINT "REL_4a5078cf70278225fd7526f561" UNIQUE ("requisitionId"), CONSTRAINT "PK_e1f7f1dfe2d89aad33a16c5dba7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "issuing_items" ("id" SERIAL NOT NULL, "voucherId" integer NOT NULL, "itemId" integer NOT NULL, "itemName" character varying(200) NOT NULL, "requestedQty" integer NOT NULL, "issuedQty" integer NOT NULL DEFAULT '0', "balance" integer NOT NULL, CONSTRAINT "PK_c58cb3043afae928b6907caf9b6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "items" ("id" SERIAL NOT NULL, "itemCode" character varying(20) NOT NULL, "itemName" character varying(200) NOT NULL, "category" character varying(12) NOT NULL, "quantity" integer NOT NULL DEFAULT '0', "unit" character varying(20) NOT NULL, "dateReceived" date NOT NULL, "supplierId" integer, "unitPrice" numeric(10,2), "description" text, "reorderLevel" integer NOT NULL DEFAULT '10', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_509af52f9512d5cf0f0d1cc8a49" UNIQUE ("itemCode"), CONSTRAINT "PK_ba5885359424c15ca6b9e79bcf6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "requisition_items" ("id" SERIAL NOT NULL, "requisitionId" integer NOT NULL, "itemId" integer NOT NULL, "requestedQty" integer NOT NULL, "itemName" character varying(200) NOT NULL, CONSTRAINT "PK_9abc61153c001d72d089e11c715" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."requisitions_status_enum" AS ENUM('pending', 'forwarded', 'issued', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "requisitions" ("id" SERIAL NOT NULL, "departmentName" character varying(100) NOT NULL, "status" "public"."requisitions_status_enum" NOT NULL DEFAULT 'pending', "requisitionDate" date NOT NULL, "createdById" integer, "notes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_be24649237292ddbd473f3ded92" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'subordinate')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying(50) NOT NULL, "password" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'subordinate', "fullName" character varying(100), "email" character varying(100), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" ADD CONSTRAINT "FK_1de7eb246940b05765d2c99a7ec" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" ADD CONSTRAINT "FK_fe5b0e9db9479afaa7320cb836f" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" ADD CONSTRAINT "FK_0c3ff892a9f2ed16f59d31cccae" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issuing_vouchers" ADD CONSTRAINT "FK_4a5078cf70278225fd7526f5612" FOREIGN KEY ("requisitionId") REFERENCES "requisitions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issuing_items" ADD CONSTRAINT "FK_d52f947d739a0ea9f1e2a90427d" FOREIGN KEY ("voucherId") REFERENCES "issuing_vouchers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "issuing_items" ADD CONSTRAINT "FK_108fdf5e5348d5bfd54914489b8" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "items" ADD CONSTRAINT "FK_acc043f0f22a28b521fe43a28b0" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requisition_items" ADD CONSTRAINT "FK_c712dfedce10364743c568be6a4" FOREIGN KEY ("requisitionId") REFERENCES "requisitions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requisition_items" ADD CONSTRAINT "FK_049db6111c3eb2209fea24fe0f2" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requisitions" ADD CONSTRAINT "FK_efd9452faf945ad4f8dc1687429" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "requisitions" DROP CONSTRAINT "FK_efd9452faf945ad4f8dc1687429"`);
        await queryRunner.query(`ALTER TABLE "requisition_items" DROP CONSTRAINT "FK_049db6111c3eb2209fea24fe0f2"`);
        await queryRunner.query(`ALTER TABLE "requisition_items" DROP CONSTRAINT "FK_c712dfedce10364743c568be6a4"`);
        await queryRunner.query(`ALTER TABLE "items" DROP CONSTRAINT "FK_acc043f0f22a28b521fe43a28b0"`);
        await queryRunner.query(`ALTER TABLE "issuing_items" DROP CONSTRAINT "FK_108fdf5e5348d5bfd54914489b8"`);
        await queryRunner.query(`ALTER TABLE "issuing_items" DROP CONSTRAINT "FK_d52f947d739a0ea9f1e2a90427d"`);
        await queryRunner.query(`ALTER TABLE "issuing_vouchers" DROP CONSTRAINT "FK_4a5078cf70278225fd7526f5612"`);
        await queryRunner.query(`ALTER TABLE "purchase_orders" DROP CONSTRAINT "FK_0c3ff892a9f2ed16f59d31cccae"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" DROP CONSTRAINT "FK_fe5b0e9db9479afaa7320cb836f"`);
        await queryRunner.query(`ALTER TABLE "purchase_order_items" DROP CONSTRAINT "FK_1de7eb246940b05765d2c99a7ec"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "requisitions"`);
        await queryRunner.query(`DROP TYPE "public"."requisitions_status_enum"`);
        await queryRunner.query(`DROP TABLE "requisition_items"`);
        await queryRunner.query(`DROP TABLE "items"`);
        await queryRunner.query(`DROP TABLE "issuing_items"`);
        await queryRunner.query(`DROP TABLE "issuing_vouchers"`);
        await queryRunner.query(`DROP TYPE "public"."issuing_vouchers_status_enum"`);
        await queryRunner.query(`DROP TABLE "suppliers"`);
        await queryRunner.query(`DROP TABLE "purchase_orders"`);
        await queryRunner.query(`DROP TYPE "public"."purchase_orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "purchase_order_items"`);
    }

}
