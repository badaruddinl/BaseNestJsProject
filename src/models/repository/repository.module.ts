import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from '../entities/attachment.entity';
import { Banks } from '../entities/bank.entity';
import { MagicCode } from '../entities/magic-code.entity';
import { UsersAddress } from '../entities/users-address.entity';
// import { MerchantApproval } from '../entities/merchant-approval.entity';
// import { Merchant } from '../entities/merchant.entity';
// import { Notification } from '../entities/notification.entity';
// import { PaymentMethod } from '../entities/payment-method.entity';
// import { ProductOrderList } from '../entities/product-order-list.entity';
// import { ProductOrder } from '../entities/product-order.entity';
// import { Product } from '../entities/product.entity';
// import { ShippingAddress } from '../entities/shipping-address.entity';
// import { ShippingMethod } from '../entities/shipping-method.entity';
import { Users } from '../entities/users.entity';
import { RepositoryService } from './repository.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Users,
      MagicCode,
      Banks,
      UsersAddress,
      Attachment,
      // Merchant,
      // Product,
      // MerchantApproval,
      // PaymentMethod,
      // ProductOrder,
      // ProductOrderList,
      // ShippingAddress,
      // ShippingMethod,
      // Notification,
    ]),
  ],
  providers: [RepositoryService],
  exports: [RepositoryService],
})
export class RepositoryModule {}
