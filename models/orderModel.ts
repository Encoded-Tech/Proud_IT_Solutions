import { Schema, Document, model, models, Types } from "mongoose";

export interface IOrderItem {
  product: Types.ObjectId;
  variant?: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface IDeliveryInfo {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  instructions?: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  orderItems: IOrderItem[];
  totalPrice: number;
  paymentStatus: "pending" | "submitted" | "paid" | "failed";
  orderStatus: "pending" | "processing" | "delivered" | "cancelled" | "failed";
  paymentMethod: "COD" | "OnlineUpload";
  paymentProof: string;
  paymentSubmittedAt: Date;
  deliveryInfo: IDeliveryInfo;
  expiresAt?: Date;
  stockProcessed: boolean;
  totalSalesUpdated: boolean;
  createdAt: Date;
  updatedAt: Date;

  // inside IOrder
buildRequest?: Types.ObjectId | null;
orderType: "product" | "build";

  deliveredAt?: Date;
  cancelledAt?: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant: { type: Schema.Types.ObjectId, ref: "ProductVariant" },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const deliveryInfoSchema = new Schema<IDeliveryInfo>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    instructions: { type: String },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderItems: [orderItemSchema],
    orderType: {
    type: String,
    enum: ["product", "build"],
    default: "product", // 👈 backward compatible
  },

  buildRequest: {
    type: Schema.Types.ObjectId,
    ref: "BuildRequest",
    default: null,
  },

    totalPrice: { type: Number, required: true },

    paymentStatus: {
      type: String,
      enum: ["pending", "submitted", "paid", "failed"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "OnlineUpload"],
      required: true,
    },

    paymentProof: {
      type: String,
    },

    paymentSubmittedAt: {
      type: Date,
    },

    expiresAt: {
      type: Date,
    },

    stockProcessed: {
      type: Boolean,
      default: false,
    },

    totalSalesUpdated: {
      type: Boolean, 
      default: false },

    orderStatus: {
      type: String,
      enum: ["pending", "processing", "delivered", "cancelled", "failed"],
      default: "pending",
    },
    deliveryInfo: deliveryInfoSchema,
  },
  { timestamps: true }
);

export const Order = models.Order || model<IOrder>("Order", orderSchema);

// import { Schema, Document, model, models, Types } from "mongoose";

// /* ------------------------------------------------------------------ */
// /* ORDER ITEM                                                         */
// /* ------------------------------------------------------------------ */
// export interface IOrderItem {
//   product: Types.ObjectId;
//   variant?: Types.ObjectId;
//   quantity: number;
//   price: number;
// }

// /* ------------------------------------------------------------------ */
// /* DELIVERY INFO                                                      */
// /* ------------------------------------------------------------------ */
// export interface IDeliveryInfo {
//   name: string;
//   phone: string;
//   address: string;
//   city: string;
//   postalCode: string;
//   country: string;
//   instructions?: string;
// }

// /* ------------------------------------------------------------------ */
// /* ORDER INTERFACE                                                    */
// /* ------------------------------------------------------------------ */
// export interface IOrder extends Document {
//   user: Types.ObjectId;
//   orderItems: IOrderItem[];

//   /* Pricing */
//   totalPrice: number;              // Products total
//   deliveryCharge: number;          // 0 or 1000
//   advanceRequired: number;          // 0 or 5000
//   payableAmount: number;            // Remaining amount after advance

//   /* Payment */
//   paymentMethod: "COD" | "OnlineUpload";

//   // Full payment (OnlineUpload)
//   paymentStatus: "pending" | "submitted" | "paid" | "failed";
//   paymentProof?: string;
//   paymentSubmittedAt?: Date;

//   // COD Advance payment
//   advancePaymentProof?: string;
//   advancePaid: boolean;
//   advancePaidAt?: Date;

//   /* Order state */
//   orderStatus: "pending" | "processing" | "delivered" | "cancelled" | "failed";

//   /* Delivery */
//   deliveryInfo: IDeliveryInfo;

//   /* Build / Product */
//   orderType: "product" | "build";
//   buildRequest?: Types.ObjectId | null;

//   /* System */
//   expiresAt?: Date;
//   stockProcessed: boolean;
//   totalSalesUpdated: boolean;

//   deliveredAt?: Date;
//   cancelledAt?: Date;

//   createdAt: Date;
//   updatedAt: Date;
// }

// /* ------------------------------------------------------------------ */
// /* SCHEMAS                                                            */
// /* ------------------------------------------------------------------ */

// const orderItemSchema = new Schema<IOrderItem>(
//   {
//     product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
//     variant: { type: Schema.Types.ObjectId, ref: "ProductVariant" },
//     quantity: { type: Number, required: true, min: 1 },
//     price: { type: Number, required: true },
//   },
//   { _id: false }
// );

// const deliveryInfoSchema = new Schema<IDeliveryInfo>(
//   {
//     name: { type: String, required: true },
//     phone: { type: String, required: true },
//     address: { type: String, required: true },
//     city: { type: String, required: true },
//     postalCode: { type: String, required: true },
//     country: { type: String, required: true },
//     instructions: { type: String },
//   },
//   { _id: false }
// );

// /* ------------------------------------------------------------------ */
// /* ORDER SCHEMA                                                       */
// /* ------------------------------------------------------------------ */
// const orderSchema = new Schema<IOrder>(
//   {
//     user: { type: Schema.Types.ObjectId, ref: "User", required: true },

//     orderItems: [orderItemSchema],

//     /* Order type */
//     orderType: {
//       type: String,
//       enum: ["product", "build"],
//       default: "product",
//     },

//     buildRequest: {
//       type: Schema.Types.ObjectId,
//       ref: "BuildRequest",
//       default: null,
//     },

//     /* Pricing */
//     totalPrice: { type: Number, required: true },
//     deliveryCharge: { type: Number, default: 0 },
//     advanceRequired: { type: Number, default: 0 },
//     payableAmount: { type: Number, required: true },

//     /* Payment */
//     paymentMethod: {
//       type: String,
//       enum: ["COD", "OnlineUpload"],
//       required: true,
//     },

//     paymentStatus: {
//       type: String,
//       enum: ["pending", "submitted", "paid", "failed"],
//       default: "pending",
//     },

//     paymentProof: {
//       type: String,
//     },

//     paymentSubmittedAt: {
//       type: Date,
//     },

//     /* COD Advance */
//     advancePaymentProof: {
//       type: String,
//     },

//     advancePaid: {
//       type: Boolean,
//       default: false,
//     },

//     advancePaidAt: {
//       type: Date,
//     },

//     /* Order state */
//     orderStatus: {
//       type: String,
//       enum: ["pending", "processing", "delivered", "cancelled", "failed"],
//       default: "pending",
//     },

//     /* Delivery */
//     deliveryInfo: deliveryInfoSchema,

//     /* System */
//     expiresAt: { type: Date },

//     stockProcessed: {
//       type: Boolean,
//       default: false,
//     },

//     totalSalesUpdated: {
//       type: Boolean,
//       default: false,
//     },

//     deliveredAt: { type: Date },
//     cancelledAt: { type: Date },
//   },
//   { timestamps: true }
// );

// /* ------------------------------------------------------------------ */
// /* MODEL EXPORT                                                       */
// /* ------------------------------------------------------------------ */
// export const Order =
//   models.Order || model<IOrder>("Order", orderSchema);



  //user server actions
  
  // export async function createOrderAction(
  //     input: CreateOrderInput
  // ): Promise<CreateOrderResult> {
  //     try {
  //         /* -------------------- AUTH -------------------- */
  //         const user = await requireUser();
  
  
  //        const { items, deliveryInfo, paymentMethod, source } = input;
  
  
  //         /* -------------------- VALIDATION -------------------- */
  
  //         if (!items || items.length === 0) {
  //             return { success: false, message: "Cart is empty" };
  //         }
  
  //         if (!["COD", "OnlineUpload"].includes(paymentMethod)) {
  //             return { success: false, message: "Invalid payment method" };
  //         }
  
  //         const requiredDeliveryFields = [
  //             deliveryInfo?.name,
  //             deliveryInfo?.phone,
  //             deliveryInfo?.address,
  //             deliveryInfo?.city,
  //             deliveryInfo?.postalCode,
  //             deliveryInfo?.country,
  //         ];
  
  //         if (requiredDeliveryFields.some((f) => !f)) {
  //             return { success: false, message: "Incomplete delivery information" };
  //         }
  
  
      
  
  //         /* -------------------- PREVENT DUPLICATE PENDING ORDERS -------------------- */
  
  //         //     const pendingOrders = await Order.find({
  //         //   user: user.id,
  //         //   paymentStatus: "pending",
  //         //   expiresAt: { $gt: new Date() },
  //         // });
  
  //         // const hasDuplicateItem = pendingOrders.some(order =>
  //         //   order.orderItems.some((existingItem: IOrderItem) =>
  //         //     items.some(newItem =>
  //         //       String(existingItem.product) === newItem.product &&
  //         //       String(existingItem.variant || "") === (newItem.variant || "")
  //         //     )
  //         //   )
  //         // );
  
  //         // if (hasDuplicateItem) {
  //         //   return {
  //         //     success: false,
  //         //     message: "You already have a pending order for one or more items in your cart",
  //         //   };
  //         // }
  
  //         const pendingOrders = await Order.find({
  //             user: user.id,
  //             paymentStatus: "pending",
  //                orderStatus: { $ne: "cancelled" },
  //             expiresAt: { $gt: new Date() },
  //         });
  
  //         const normalizeItems = (items: CheckoutItemInput[]) =>
  //             items
  //                 .map(i => `${i.product}_${i.variant || "no-variant"}_${i.quantity}`)
  //                 .sort()
  //                 .join("|");
  
  //         const newOrderSignature = normalizeItems(items);
  
  //         const isExactDuplicate = pendingOrders.some(order => {
  //             const existingSignature = normalizeItems(
  //                 order.orderItems.map((i: IOrderItem) => ({
  //                     product: String(i.product),
  //                     variant: i.variant ? String(i.variant) : undefined,
  //                     quantity: i.quantity,
  //                 }))
  //             );
  
  //             return existingSignature === newOrderSignature;
  //         });
  
  //         if (isExactDuplicate) {
  //             return {
  //                 success: false,
  //                 message: "You already placed this exact order and it is still pending",
  //             };
  //         }
  
  //         /* -------------------- PRICE + STOCK CALCULATION -------------------- */
  
  //         let totalPrice = 0;
  //         const orderItems: IOrderItem[] = [];
  
  //         for (const item of items) {
  //             const { product: productId, variant: variantId, quantity } = item;
  
  //             if (!Number.isInteger(quantity) || quantity < MIN_QTY_PER_ITEM) {
  //                 return {
  //                     success: false,
  //                     message: "Invalid quantity in cart",
  //                 };
  //             }
  
  //             const product = await Product.findById(productId).populate({
  //                 path: "variants",
  //                 match: { isActive: true },
  //                 select: "sku price",
  //             });
  
  //             if (!product || !product.isActive) {
  //                 return {
  //                     success: false,
  //                     message: "One or more products are unavailable",
  //                 };
  //             }
  
  //             const availableStock =
  //                 product.stock - (product.reservedStock || 0);
  
  //             if (availableStock < quantity) {
  //                 return {
  //                     success: false,
  //                     message: `Not enough stock for ${product.name}`,
  //                 };
  //             }
  
  //             let correctPrice = product.price;
  
  //             if (variantId) {
  //                 const variant = product.variants.find(
  //                     (v: IProductVariant) => String(v._id) === variantId
  //                 );
  
  //                 if (!variant) {
  //                     return {
  //                         success: false,
  //                         message: `Invalid variant for ${product.name}`,
  //                     };
  //                 }
  
  //                 correctPrice = variant.price;
  //             }
  
  //             totalPrice += correctPrice * quantity;
  
  //             /* Reserve stock */
  //             product.reservedStock =
  //                 (product.reservedStock || 0) + quantity;
  //             await product.save();
  
  //             orderItems.push({
  //                 product: product._id,
  //                 variant: variantId ? new Types.ObjectId(variantId) : undefined,
  //                 quantity,
  //                 price: correctPrice,
  //             });
  //         }
  
  //         /* -------------------- CREATE ORDER -------------------- */
  
  //         const expiresAt = new Date(
  //             Date.now() + ORDER_EXPIRY_HOURS * 60 * 60 * 1000
  //         );
  
  //         const order = await Order.create({
  //             user: user.id,
  //             orderItems,
  //             totalPrice,
  //             paymentMethod,
  //             paymentStatus: "pending",
  //             orderStatus: "pending",
  //             deliveryInfo,
  //             expiresAt,
  //         });
  
  //         if (source === "cart") {
  //             await userModel.findByIdAndUpdate(user.id, {
  //                 $set: { cart: [] },
  //             });
  //         }
  
  //         /* -------------------- EMAIL -------------------- */
  //         try {
  //             const dbUser = await userModel
  //                 .findById(user.id)
  //                 .select("email name");
  
  //             if (dbUser?.email) {
  //                 await sendEmail({
  //                     to: dbUser.email,
  //                     subject: "Order Placed Successfully",
  //                     html: `
  //         <h2>Hi ${dbUser.name},</h2>
  //         <p>Your order has been placed successfully.</p>
  //         <p><strong>Order ID:</strong> ${order._id}</p>
  //         <p><strong>Total:</strong> Rs. ${totalPrice}</p>
  //       `,
  //                 });
  //             }
  //         } catch (emailError) {
  //             console.error("EMAIL FAILED (order still created):", emailError);
  //         }
  
  //         return {
  //             success: true,
  //             message: "Order placed successfully! 🎉",
  //             orderId: String(order._id),
  //         };
  //     } catch (error) {
  //         console.error(
  //             "CREATE ORDER ERROR:",
  //             error instanceof Error ? error.message : error
  //         );
  
  //         return {
  //             success: false,
  //             message: "Failed to place order",
  //         };
  //     }
  // }
  
  // export async function createOrderAction(
  //   input: CreateOrderInput
  // ): Promise<CreateOrderResult> {
  //   try {
  //     /* -------------------- AUTH -------------------- */
  //     const user = await requireUser();
  
  //     const {
  //       items,
  //       deliveryInfo,
  //       paymentMethod,
  //       source,
  //       buildId,
  //     } = input;
  
  //     /* -------------------- VALIDATION -------------------- */
  
  //     if (!items || items.length === 0) {
  //       return { success: false, message: "Cart is empty" };
  //     }
  
  //     if (!["COD", "OnlineUpload"].includes(paymentMethod)) {
  //       return { success: false, message: "Invalid payment method" };
  //     }
  
  //     const requiredDeliveryFields = [
  //       deliveryInfo?.name,
  //       deliveryInfo?.phone,
  //       deliveryInfo?.address,
  //       deliveryInfo?.city,
  //       deliveryInfo?.postalCode,
  //       deliveryInfo?.country,
  //     ];
  
  //     if (requiredDeliveryFields.some((f) => !f)) {
  //       return { success: false, message: "Incomplete delivery information" };
  //     }
  
  //     /* -------------------- BUILD SOURCE VALIDATION -------------------- */
  //     let buildRequest = null;
  // if (source === "build") {
  //   if (!buildId || !isValidObjectId(buildId)) {
  //     return { success: false, message: "Invalid build request" };
  //   }
  
  //   buildRequest = await BuildRequest.findOne({
  //     _id: buildId,
  //     user: user.id,
  //   });
  
  //   if (!buildRequest) {
  //     return { success: false, message: "Build request not found" };
  //   }
  
  //   if (buildRequest.status !== "approved") {
  //     return {
  //       success: false,
  //       message: "This build must be approved before checkout",
  //     };
  //   }
  
  //   if (buildRequest.checkoutOrder) {
  //     return {
  //       success: false,
  //       message: "This build has already been checked out",
  //     };
  //   }
  // }
  
  
  //     /* -------------------- PREVENT DUPLICATE PENDING ORDERS -------------------- */
  
  //     const pendingOrders = await Order.find({
  //       user: user.id,
  //       paymentStatus: "pending",
  //       orderStatus: { $ne: "cancelled" },
  //       expiresAt: { $gt: new Date() },
  //     });
  
  //     const normalizeItems = (items: CheckoutItemInput[]) =>
  //       items
  //         .map(
  //           (i) =>
  //             `${i.product}_${i.variant || "no-variant"}_${i.quantity}`
  //         )
  //         .sort()
  //         .join("|");
  
  //     const newOrderSignature = normalizeItems(items);
  
  //     const isExactDuplicate = pendingOrders.some((order) => {
  //       const existingSignature = normalizeItems(
  //         order.orderItems.map((i: IOrderItem) => ({
  //           product: String(i.product),
  //           variant: i.variant ? String(i.variant) : undefined,
  //           quantity: i.quantity,
  //         }))
  //       );
  //       return existingSignature === newOrderSignature;
  //     });
  
  //     if (isExactDuplicate) {
  //       return {
  //         success: false,
  //         message: "You already placed this exact order and it is still pending",
  //       };
  //     }
  
  //     /* -------------------- PRICE + STOCK CALCULATION -------------------- */
  
  //     let totalPrice = 0;
  //     const orderItems: IOrderItem[] = [];
  
  //     for (const item of items) {
  //       const { product: productId, variant: variantId, quantity } = item;
  
  //       if (!Number.isInteger(quantity) || quantity < MIN_QTY_PER_ITEM) {
  //         return {
  //           success: false,
  //           message: "Invalid quantity in cart",
  //         };
  //       }
  
  //       const product = await Product.findById(productId).populate({
  //         path: "variants",
  //         match: { isActive: true },
  //         select: "sku price",
  //       });
  
  //       if (!product || !product.isActive) {
  //         return {
  //           success: false,
  //           message: "One or more products are unavailable",
  //         };
  //       }
  
  //       const availableStock =
  //         product.stock - (product.reservedStock || 0);
  
  //       if (availableStock < quantity) {
  //         return {
  //           success: false,
  //           message: `Not enough stock for ${product.name}`,
  //         };
  //       }
  
  //       let correctPrice = product.price;
  
  //       if (variantId) {
  //         const variant = product.variants.find(
  //           (v: IProductVariant) => String(v._id) === variantId
  //         );
  
  //         if (!variant) {
  //           return {
  //             success: false,
  //             message: `Invalid variant for ${product.name}`,
  //           };
  //         }
  
  //         correctPrice = variant.price;
  //       }
  
  //       totalPrice += correctPrice * quantity;
  
  //       product.reservedStock =
  //         (product.reservedStock || 0) + quantity;
  //       await product.save();
  
  //       orderItems.push({
  //         product: product._id,
  //         variant: variantId
  //           ? new Types.ObjectId(variantId)
  //           : undefined,
  //         quantity,
  //         price: correctPrice,
  //       });
  //     }
  
  //     /* -------------------- CREATE ORDER -------------------- */
  
  //     const expiresAt = new Date(
  //       Date.now() + ORDER_EXPIRY_HOURS * 60 * 60 * 1000
  //     );
  
  //     const order = await Order.create({
  //       user: user.id,
  //       orderItems,
  //       totalPrice,
  //       paymentMethod,
  //       paymentStatus: "pending",
  //       orderStatus: "pending",
  //       deliveryInfo,
  //       expiresAt,
  //       source,
  //       buildRequest: source === "build" ? buildId : undefined,
  //     });
  
  //     /* -------------------- LINK BUILD → ORDER -------------------- */
  //     if (source === "build" && buildRequest) {
  //       buildRequest.checkoutOrder = order._id;
  //       buildRequest.status = "checked_out";
  //       await buildRequest.save();
  //     }
  
  //     if (source === "cart") {
  //       await userModel.findByIdAndUpdate(user.id, {
  //         $set: { cart: [] },
  //       });
  //     }
  
  //     /* -------------------- EMAIL -------------------- */
  //     try {
  //       const dbUser = await userModel
  //         .findById(user.id)
  //         .select("email name");
  
  //       if (dbUser?.email) {
  //         await sendEmail({
  //           to: dbUser.email,
  //           subject: "Order Placed Successfully",
  //           html: `
  //             <h2>Hi ${dbUser.name},</h2>
  //             <p>Your order has been placed successfully.</p>
  //             <p><strong>Order ID:</strong> ${order._id}</p>
  //             <p><strong>Total:</strong> Rs. ${totalPrice}</p>
  //           `,
  //         });
  //       }
  //     } catch (emailError) {
  //       console.error("EMAIL FAILED (order still created):", emailError);
  //     }
  
  //     return {
  //       success: true,
  //       message: "Order placed successfully! 🎉",
  //       orderId: String(order._id),
  //     };
  //   } catch (error) {
  //     console.error(
  //       "CREATE ORDER ERROR:",
  //       error instanceof Error ? error.message : error
  //     );
  
  //     return {
  //       success: false,
  //       message: "Failed to place order",
  //     };
  //   }
  // }
  // export async function createOrderAction(
  //   input: CreateOrderInput
  // ): Promise<CreateOrderResult> {
  //   try {
  //     /* -------------------- AUTH -------------------- */
  //     const user = await requireUser();
  
  //     const {
  //       items,
  //       deliveryInfo,
  //       paymentMethod,
  //       source,
  //       buildId,
  //       advancePaymentProof, // COD advance receipt
  //       paymentProof,        // Online payment receipt
  //     } = input;
  
  //     /* -------------------- VALIDATION -------------------- */
  //     if (!items || items.length === 0) {
  //       return { success: false, message: "Cart is empty" };
  //     }
  
  //     if (!["COD", "OnlineUpload"].includes(paymentMethod)) {
  //       return { success: false, message: "Invalid payment method" };
  //     }
  
  //     const requiredDeliveryFields = [
  //       deliveryInfo?.name,
  //       deliveryInfo?.phone,
  //       deliveryInfo?.address,
  //       deliveryInfo?.city,
  //       deliveryInfo?.postalCode,
  //       deliveryInfo?.country,
  //     ];
  
  //     if (requiredDeliveryFields.some((f) => !f)) {
  //       return { success: false, message: "Incomplete delivery information" };
  //     }
  
  //     /* -------------------- BUILD SOURCE VALIDATION -------------------- */
  //     let buildRequest = null;
  //     if (source === "build") {
  //       if (!buildId || !isValidObjectId(buildId)) {
  //         return { success: false, message: "Invalid build request" };
  //       }
  
  //       buildRequest = await BuildRequest.findOne({
  //         _id: buildId,
  //         user: user.id,
  //       });
  
  //       if (!buildRequest) {
  //         return { success: false, message: "Build request not found" };
  //       }
  
  //       if (buildRequest.status !== "approved") {
  //         return {
  //           success: false,
  //           message: "This build must be approved before checkout",
  //         };
  //       }
  
  //       if (buildRequest.checkoutOrder) {
  //         return {
  //           success: false,
  //           message: "This build has already been checked out",
  //         };
  //       }
  //     }
  
  //     /* -------------------- DUPLICATE PENDING ORDER CHECK -------------------- */
  //     const pendingOrders = await Order.find({
  //       user: user.id,
  //       paymentStatus: "pending",
  //       orderStatus: { $ne: "cancelled" },
  //       expiresAt: { $gt: new Date() },
  //     });
  
  //     const normalizeItems = (items: CheckoutItemInput[]) =>
  //       items
  //         .map((i) => `${i.product}_${i.variant || "no-variant"}_${i.quantity}`)
  //         .sort()
  //         .join("|");
  
  //     const newOrderSignature = normalizeItems(items);
  
  //     const isExactDuplicate = pendingOrders.some((order) => {
  //       const existingSignature = normalizeItems(
  //         order.orderItems.map((i: IOrderItem) => ({
  //           product: String(i.product),
  //           variant: i.variant ? String(i.variant) : undefined,
  //           quantity: i.quantity,
  //         }))
  //       );
  //       return existingSignature === newOrderSignature;
  //     });
  
  //     if (isExactDuplicate) {
  //       return {
  //         success: false,
  //         message: "You already placed this exact order and it is still pending",
  //       };
  //     }
  
  //     /* -------------------- PRICE + STOCK CALCULATION -------------------- */
  //     let totalPrice = 0;
  //     const orderItems: IOrderItem[] = [];
  
  //     for (const item of items) {
  //       const { product: productId, variant: variantId, quantity } = item;
  
  //       if (!Number.isInteger(quantity) || quantity < MIN_QTY_PER_ITEM) {
  //         return { success: false, message: "Invalid quantity in cart" };
  //       }
  
  //       const product = await Product.findById(productId).populate({
  //         path: "variants",
  //         match: { isActive: true },
  //         select: "sku price",
  //       });
  
  //       if (!product || !product.isActive) {
  //         return {
  //           success: false,
  //           message: "One or more products are unavailable",
  //         };
  //       }
  
  //       const availableStock =
  //         product.stock - (product.reservedStock || 0);
  
  //       if (availableStock < quantity) {
  //         return {
  //           success: false,
  //           message: `Not enough stock for ${product.name}`,
  //         };
  //       }
  
  //       let correctPrice = product.price;
  
  //       if (variantId) {
  //         const variant = product.variants.find(
  //           (v: IProductVariant) => String(v._id) === variantId
  //         );
  
  //         if (!variant) {
  //           return {
  //             success: false,
  //             message: `Invalid variant for ${product.name}`,
  //           };
  //         }
  
  //         correctPrice = variant.price;
  //       }
  
  //       totalPrice += correctPrice * quantity;
  
  //       product.reservedStock =
  //         (product.reservedStock || 0) + quantity;
  //       await product.save();
  
  //       orderItems.push({
  //         product: product._id,
  //         variant: variantId ? new Types.ObjectId(variantId) : undefined,
  //         quantity,
  //         price: correctPrice,
  //       });
  //     }
  
  //     /* -------------------- DELIVERY + ADVANCE LOGIC -------------------- */
  //     const KATHMANDU_VALLEY = ["Kathmandu", "Lalitpur", "Bhaktapur"];
  //     const isOutsideValley = !KATHMANDU_VALLEY.includes(deliveryInfo.city);
  //     const deliveryCharge = isOutsideValley ? 1000 : 0;
  //     const advanceRequired = paymentMethod === "COD" ? 5000 : 0;
  
  //     // COD requires advance receipt upload
  //     if (paymentMethod === "COD" && advanceRequired > 0 && !advancePaymentProof) {
  //       return {
  //         success: false,
  //         message: "Advance payment receipt is required for COD orders",
  //       };
  //     }
  
  //     // OnlineUpload requires full payment receipt
  //     if (paymentMethod === "OnlineUpload" && !paymentProof) {
  //       return {
  //         success: false,
  //         message: "Payment receipt is required for online payment",
  //       };
  //     }
  
  //     const payableAmount =
  //       totalPrice + deliveryCharge - (paymentMethod === "COD" ? advanceRequired : 0);
  
  //     /* -------------------- CREATE ORDER -------------------- */
  //     const expiresAt = new Date(
  //       Date.now() + ORDER_EXPIRY_HOURS * 60 * 60 * 1000
  //     );
  
  //     const order = await Order.create({
  //       user: user.id,
  //       orderItems,
  
  //       totalPrice,
  //       deliveryCharge,
  //       advanceRequired,
  //       payableAmount,
  
  //       paymentMethod,
  //       paymentStatus: paymentMethod === "OnlineUpload" ? "submitted" : "pending",
  //       paymentProof: paymentMethod === "OnlineUpload" ? paymentProof : undefined,
  
  //       // COD advance upload but NOT marked paid yet
  //       advancePaymentProof: paymentMethod === "COD" ? advancePaymentProof : undefined,
  //       advancePaid: false, // 👈 must be verified by admin
  //       advancePaidAt: undefined,
  
  //       orderStatus: "pending",
  //       deliveryInfo,
  //       expiresAt,
  
  //       orderType: source === "build" ? "build" : "product",
  //       buildRequest: source === "build" ? buildId : null,
  //     });
  
  //     /* -------------------- LINK BUILD → ORDER -------------------- */
  //     if (source === "build" && buildRequest) {
  //       buildRequest.checkoutOrder = order._id;
  //       buildRequest.status = "checked_out";
  //       await buildRequest.save();
  //     }
  
  //     /* -------------------- CLEAR CART -------------------- */
  //     if (source === "cart") {
  //       await userModel.findByIdAndUpdate(user.id, {
  //         $set: { cart: [] },
  //       });
  //     }
  
  //     /* -------------------- EMAIL -------------------- */
  //     try {
  //       const dbUser = await userModel.findById(user.id).select("email name");
  //       if (dbUser?.email) {
  //         await sendEmail({
  //           to: dbUser.email,
  //           subject: "Order Placed Successfully",
  //           html: `
  //             <h2>Hi ${dbUser.name},</h2>
  //             <p>Your order has been placed successfully.</p>
  //             <p><strong>Order ID:</strong> ${order._id}</p>
  //             <p><strong>Total:</strong> Rs. ${totalPrice}</p>
  //             ${
  //               advanceRequired > 0
  //                 ? `<p><strong>Advance Required (Pending Verification):</strong> Rs. ${advanceRequired}</p>`
  //                 : ""
  //             }
  //             ${
  //               deliveryCharge > 0
  //                 ? `<p><strong>Delivery Charge:</strong> Rs. ${deliveryCharge}</p>`
  //                 : ""
  //             }
  //             <p><strong>Payable Amount:</strong> Rs. ${payableAmount}</p>
  //             ${
  //               paymentMethod === "COD"
  //                 ? `<p>Your advance receipt has been uploaded and is pending admin verification.</p>`
  //                 : ""
  //             }
  //           `,
  //         });
  //       }
  //     } catch (emailError) {
  //       console.error("EMAIL FAILED (order still created):", emailError);
  //     }
  
  //     return {
  //       success: true,
  //       message:
  //         paymentMethod === "COD"
  //           ? "Order placed! Your advance receipt is uploaded and pending admin verification."
  //           : "Order placed successfully! 🎉",
  //       orderId: String(order._id),
  //     };
  //   } catch (error) {
  //     console.error(
  //       "CREATE ORDER ERROR:",
  //       error instanceof Error ? error.message : error
  //     );
  
  //     return {
  //       success: false,
  //       message: "Failed to place order",
  //     };
  //   }
  // }
  
  