// storage.ts
import { users, categories, tasks, offers, reviews, messages, notifications, payments, sessions, } from "./shared/schema.js";
import { db, pgPool } from "./db.js"; // pgPool y db (drizzle) disponibles
import { eq, desc, and, sql, count, not, asc, or } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';
// Use the pool exported from ./db (pgPool) which is configured centrally
const customPgPool = pgPool;
export class DatabaseStorage {
    async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
    }
    async getUserById(userId) {
        const sqlQuery = `
      SELECT id,
        email,
        COALESCE(encrypted_password, password) AS password,
        role,
        created_at,
        updated_at
      FROM auth.users
      WHERE id = $1
      LIMIT 1
    `;
        try {
            const res = await customPgPool.query(sqlQuery, [userId]);
            const row = res.rows[0];
            if (!row)
                return undefined;
            return {
                id: row.id,
                email: row.email,
                password: row.password,
                role: row.role ?? 'user',
                firstName: null,
                lastName: null,
                profileImageUrl: null,
                isTasker: false,
                phone: null,
                location: null,
                bio: null,
                skills: [],
                hourlyRate: null,
                totalEarnings: null,
                totalTasks: 0,
                rating: 0,
                reviewCount: 0,
                createdAt: row.created_at ?? null,
                updatedAt: row.updated_at ?? null,
            };
        }
        catch (err) {
            console.error("getUserById error:", err);
            throw err;
        }
    }
    async getUserByEmail(email) {
        const sqlQuery = `
      SELECT id,
        email,
        COALESCE(encrypted_password, password) AS password,
        role,
        created_at,
        updated_at
      FROM auth.users
      WHERE email = $1
      LIMIT 1
    `;
        try {
            const res = await customPgPool.query(sqlQuery, [email]);
            const row = res.rows[0];
            if (!row)
                return undefined;
            return {
                id: row.id,
                email: row.email,
                password: row.password,
                role: row.role ?? 'user',
                firstName: null,
                lastName: null,
                profileImageUrl: null,
                isTasker: false,
                phone: null,
                location: null,
                bio: null,
                skills: [],
                hourlyRate: null,
                totalEarnings: null,
                totalTasks: 0,
                rating: 0,
                reviewCount: 0,
                createdAt: row.created_at ?? null,
                updatedAt: row.updated_at ?? null,
            };
        }
        catch (err) {
            console.error("getUserByEmail error:", err);
            throw err;
        }
    }
    async upsertUser(userData) {
        const [user] = await db
            .insert(users)
            .values(userData)
            .onConflictDoUpdate({
            target: users.id,
            set: {
                ...userData,
                updatedAt: new Date(),
            },
        })
            .returning();
        return user;
    }
    async updateUserProfile(id, updates) {
        const [user] = await db
            .update(users)
            .set({ ...updates, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return user;
    }
    async updateUserPassword(userId, hashedPassword) {
        await db
            .update(users)
            .set({ password: hashedPassword, updatedAt: new Date() })
            .where(eq(users.id, userId));
    }
    async updateUserNotifications(userId, notifications) {
        await db
            .update(users)
            .set({ notifications })
            .where(eq(users.id, userId));
    }
    async createUser(userData) {
        const id = uuidv4();
        const [user] = await db
            .insert(users)
            .values({
            id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: userData.password,
            role: userData.role,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
            .returning();
        return user;
    }
    async deleteUserData(userId) {
        await db.delete(messages).where(or(eq(messages.senderId, userId), eq(messages.receiverId, userId)));
        await db.delete(notifications).where(eq(notifications.userId, userId));
        await db.delete(offers).where(eq(offers.taskerId, userId));
        await db.delete(reviews).where(or(eq(reviews.reviewerId, userId), eq(reviews.revieweeId, userId)));
        await db.delete(tasks).where(eq(tasks.clientId, userId));
        await db.delete(payments).where(eq(payments.userId, userId));
        try {
            await db.delete(sessions).where(sql `${sessions.sess}::jsonb ->> 'userId' = ${userId}`);
        }
        catch (err) {
            console.warn("deleteUserData: sessions delete failed (maybe table/column differs):", err);
        }
    }
    async deleteUserById(userId) {
        const client = await customPgPool.connect();
        try {
            await client.query('BEGIN');
            await client.query('DELETE FROM messages WHERE sender_id = $1 OR receiver_id = $1', [userId]);
            await client.query('DELETE FROM notifications WHERE user_id = $1', [userId]);
            await client.query('DELETE FROM offers WHERE tasker_id = $1', [userId]);
            await client.query('DELETE FROM reviews WHERE reviewer_id = $1 OR reviewee_id = $1', [userId]);
            await client.query('DELETE FROM payments WHERE user_id = $1', [userId]);
            await client.query('DELETE FROM tasks WHERE client_id = $1', [userId]);
            try {
                await client.query(`DELETE FROM sessions WHERE (sess::jsonb ->> 'userId') = $1`, [userId]);
            }
            catch (err) {
                console.warn("deleteUserById: sessions delete failed inside transaction:", err);
            }
            const deleteRes = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
            await client.query('COMMIT');
            return (deleteRes.rowCount ?? 0) > 0;
        }
        catch (err) {
            await client.query('ROLLBACK');
            console.error("deleteUserById transaction error:", err);
            throw err;
        }
        finally {
            client.release();
        }
    }
    async getCategories() {
        return await db.select().from(categories).orderBy(categories.name);
    }
    async createCategory(category) {
        const [newCategory] = await db.insert(categories).values(category).returning();
        return newCategory;
    }
    async updateCategory(id, updates) {
        const [updatedCategory] = await db.update(categories).set(updates).where(eq(categories.id, id)).returning();
        return updatedCategory;
    }
    async deleteCategory(id) {
        await db.delete(categories).where(eq(categories.id, id));
    }
    async isSlugUnique(slug, excludeId) {
        const conds = [eq(categories.slug, slug)];
        if (excludeId)
            conds.push(not(eq(categories.id, excludeId)));
        const rows = await db.select().from(categories).where(and(...conds));
        return rows.length === 0;
    }
    async getTasks(filters, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        function safeMapAssignedTasker(raw) {
            try {
                return mapAssignedTasker(raw);
            }
            catch (e) {
                console.error("Error parsing assignedTasker skills JSON:", e, raw?.skills);
                return null;
            }
        }
        function mapAssignedTasker(raw) {
            return {
                id: raw.id,
                createdAt: raw.createdAt ?? null,
                location: raw.location ?? null,
                bio: raw.bio ?? null,
                totalEarnings: raw.totalEarnings ?? null,
                email: raw.email,
                password: raw.password,
                role: raw.role,
                firstName: raw.firstName,
                lastName: raw.lastName,
                profileImageUrl: raw.profileImageUrl,
                isTasker: raw.isTasker,
                phone: raw.phone,
                skills: raw.skills ? JSON.parse(raw.skills) : [],
                hourlyRate: raw.hourlyRate !== null && raw.hourlyRate !== undefined ? String(raw.hourlyRate) : null,
                updatedAt: raw.updatedAt,
                totalTasks: raw.totalTasks ?? 0,
                rating: raw.rating ?? 0,
                reviewCount: raw.reviewCount ?? 0,
                notifications: raw.notifications ?? null,
            };
        }
        const assignedTaskerAlias = sql `users AS assigned_tasker`;
        const result = await db
            .select({
            id: tasks.id,
            title: tasks.title,
            description: tasks.description,
            categoryId: tasks.categoryId,
            clientId: tasks.clientId,
            budget: tasks.budget,
            currency: tasks.currency,
            location: tasks.location,
            status: tasks.status,
            priority: tasks.priority,
            dueDate: tasks.dueDate,
            assignedTaskerId: tasks.assignedTaskerId,
            completedAt: tasks.completedAt,
            createdAt: tasks.createdAt,
            updatedAt: tasks.updatedAt,
            category: categories,
            client: users,
            assignedTasker: {
                id: sql `assigned_tasker.id`,
                email: sql `assigned_tasker.email`,
                password: sql `assigned_tasker.password`,
                role: sql `assigned_tasker.role`,
                firstName: sql `assigned_tasker.first_name`,
                lastName: sql `assigned_tasker.last_name`,
                profileImageUrl: sql `assigned_tasker.profile_image_url`,
                isTasker: sql `assigned_tasker.is_tasker`,
                phone: sql `assigned_tasker.phone`,
                location: sql `assigned_tasker.location`,
                bio: sql `assigned_tasker.bio`,
                skills: sql `assigned_tasker.skills`,
                hourlyRate: sql `assigned_tasker.hourly_rate`,
                totalEarnings: sql `assigned_tasker.total_earnings`,
                totalTasks: sql `assigned_tasker.total_tasks`,
                rating: sql `assigned_tasker.rating`,
                reviewCount: sql `assigned_tasker.review_count`,
                createdAt: sql `assigned_tasker.created_at`,
                updatedAt: sql `assigned_tasker.updated_at`,
            },
        })
            .from(tasks)
            .leftJoin(categories, eq(tasks.categoryId, categories.id))
            .leftJoin(users, eq(tasks.clientId, users.id))
            .leftJoin(assignedTaskerAlias, eq(tasks.assignedTaskerId, sql `assigned_tasker.id`))
            .where(and(filters?.categoryId ? eq(tasks.categoryId, filters.categoryId) : undefined, filters?.categoryName ? eq(categories.name, filters.categoryName) : undefined, filters?.location ? sql `${tasks.location} ILIKE ${`%${filters.location}%`}` : undefined, filters?.status ? eq(tasks.status, filters.status) : undefined, filters?.clientId ? eq(tasks.clientId, filters.clientId) : undefined, filters?.taskerId ? eq(tasks.assignedTaskerId, filters.taskerId) : undefined))
            .orderBy(desc(tasks.createdAt))
            .limit(limit)
            .offset(offset);
        return result.map(row => ({
            ...row,
            assignedTasker: row.assignedTasker?.id ? safeMapAssignedTasker(row.assignedTasker) : null,
            client: row.client ?? null,
            category: row.category ?? null,
        }));
    }
    async getTaskById(id) {
        const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
        if (!task)
            return undefined;
        const category = task.categoryId ? await db.select().from(categories).where(eq(categories.id, task.categoryId)).then(r => r[0] || null) : null;
        const [client] = await db.select().from(users).where(eq(users.id, task.clientId));
        const assignedTasker = task.assignedTaskerId ? await db.select().from(users).where(eq(users.id, task.assignedTaskerId)).then(r => r[0] || null) : null;
        return { ...task, category, client, assignedTasker };
    }
    async createTask(task) {
        const [newTask] = await db.insert(tasks).values(task).returning();
        return newTask;
    }
    async updateTask(id, updates) {
        const [task] = await db.update(tasks).set({ ...updates, updatedAt: new Date() }).where(eq(tasks.id, id)).returning();
        return task;
    }
    async deleteTaskById(id) {
        const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
        return (result.length ?? 0) > 0;
    }
    async getTasksWithOffers(clientId) {
        return await db.select({ task: tasks, offerCount: count(offers.id) })
            .from(tasks)
            .leftJoin(offers, eq(tasks.id, offers.taskId))
            .where(eq(tasks.clientId, clientId))
            .groupBy(tasks.id)
            .orderBy(desc(tasks.createdAt));
    }
    async getOffersByTaskId(taskId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const result = await db.select({
            id: offers.id,
            taskId: offers.taskId,
            taskerId: offers.taskerId,
            amount: offers.amount,
            currency: offers.currency,
            message: offers.message,
            estimatedDuration: offers.estimatedDuration,
            status: offers.status,
            createdAt: offers.createdAt,
            updatedAt: offers.updatedAt,
            tasker: users,
        })
            .from(offers)
            .leftJoin(users, eq(offers.taskerId, users.id))
            .where(eq(offers.taskId, taskId))
            .orderBy(desc(offers.createdAt))
            .limit(limit)
            .offset(offset);
        return result.map(r => ({ ...r, tasker: r.tasker }));
    }
    async getOffersByTaskerId(taskerId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const result = await db.select({
            id: offers.id,
            taskId: offers.taskId,
            taskerId: offers.taskerId,
            amount: offers.amount,
            currency: offers.currency,
            message: offers.message,
            estimatedDuration: offers.estimatedDuration,
            status: offers.status,
            createdAt: offers.createdAt,
            updatedAt: offers.updatedAt,
            task: tasks,
        })
            .from(offers)
            .leftJoin(tasks, eq(offers.taskId, tasks.id))
            .where(eq(offers.taskerId, taskerId))
            .orderBy(desc(offers.createdAt))
            .limit(limit)
            .offset(offset);
        return result.map(r => ({ ...r, task: r.task }));
    }
    async getOfferById(id) {
        const [offer] = await db.select().from(offers).where(eq(offers.id, id));
        return offer;
    }
    async createOffer(offer) {
        const [newOffer] = await db.insert(offers).values(offer).returning();
        return newOffer;
    }
    async updateOffer(id, updates) {
        const [offer] = await db.update(offers).set(updates).where(eq(offers.id, id)).returning();
        return offer;
    }
    async updateOfferStatusById(id, status) {
        const [offer] = await db.update(offers).set({ status, updatedAt: new Date() }).where(eq(offers.id, id)).returning();
        return offer ?? null;
    }
    async listOffers(filter) {
        if (!filter || Object.keys(filter).length === 0) {
            return await db.select().from(offers).orderBy(desc(offers.createdAt));
        }
        const conditions = [];
        if (filter.status)
            conditions.push(eq(offers.status, filter.status));
        if (filter.taskId)
            conditions.push(eq(offers.taskId, filter.taskId));
        if (filter.taskerId)
            conditions.push(eq(offers.taskerId, filter.taskerId));
        return await db.select()
            .from(offers)
            .where(and(...conditions))
            .orderBy(desc(offers.createdAt));
    }
    async getReviewsByTaskerId(taskerId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const result = await db.select({ id: reviews.id, taskId: reviews.taskId, reviewerId: reviews.reviewerId, revieweeId: reviews.revieweeId, rating: reviews.rating, comment: reviews.comment, createdAt: reviews.createdAt, reviewer: users, task: tasks })
            .from(reviews)
            .leftJoin(users, eq(reviews.reviewerId, users.id))
            .leftJoin(tasks, eq(reviews.taskId, tasks.id))
            .where(eq(reviews.revieweeId, taskerId))
            .orderBy(desc(reviews.createdAt))
            .limit(limit)
            .offset(offset);
        return result.map(r => ({ ...r, reviewer: r.reviewer, task: r.task }));
    }
    async createReview(review) {
        const [newReview] = await db.insert(reviews).values(review).returning();
        // actualizar rating
        const userReviews = await db.select({ rating: reviews.rating }).from(reviews).where(eq(reviews.revieweeId, review.revieweeId));
        const avgRating = userReviews.length ? userReviews.reduce((s, r) => s + r.rating, 0) / userReviews.length : 0;
        await db.update(users).set({ rating: avgRating.toString(), reviewCount: userReviews.length }).where(eq(users.id, review.revieweeId));
        return newReview;
    }
    async getMessagesByTaskId(taskId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const list = await db.select().from(messages).where(eq(messages.taskId, taskId)).orderBy(asc(messages.createdAt)).limit(limit).offset(offset);
        const result = [];
        for (const msg of list) {
            const [sender] = await db.select().from(users).where(eq(users.id, msg.senderId));
            const [receiver] = await db.select().from(users).where(eq(users.id, msg.receiverId));
            result.push({ ...msg, sender: sender, receiver: receiver });
        }
        return result;
    }
    async getMessagesBetweenUsers(user1, user2) {
        const list = await db.select().from(messages).where(and(sql `${messages.taskId} IS NULL`, or(and(eq(messages.senderId, user1), eq(messages.receiverId, user2)), and(eq(messages.senderId, user2), eq(messages.receiverId, user1))))).orderBy(asc(messages.createdAt));
        const result = [];
        for (const msg of list) {
            const [sender] = await db.select().from(users).where(eq(users.id, msg.senderId));
            const [receiver] = await db.select().from(users).where(eq(users.id, msg.receiverId));
            result.push({ ...msg, sender: sender, receiver: receiver });
        }
        return result;
    }
    async createGeneralMessage(message) {
        const [newMessage] = await db.insert(messages).values({ ...message, taskId: null, isRead: false, readAt: null, createdAt: new Date() }).returning();
        try {
            await this.createNotificationForNewMessage(newMessage);
        }
        catch (err) {
            console.warn("notify new message failed:", err);
        }
        const [sender] = await db.select().from(users).where(eq(users.id, newMessage.senderId));
        const [receiver] = await db.select().from(users).where(eq(users.id, newMessage.receiverId));
        return { ...newMessage, sender: sender, receiver: receiver };
    }
    async createMessage(message) {
        const [newMessage] = await db.insert(messages).values({ ...message, isRead: false, readAt: null, createdAt: new Date() }).returning();
        try {
            await this.createNotificationForNewMessage(newMessage);
        }
        catch (err) {
            console.warn("notify new message failed:", err);
        }
        return newMessage;
    }
    async markMessageAsRead(messageId) {
        await db.update(messages).set({ isRead: true, readAt: new Date() }).where(eq(messages.id, messageId));
    }
    async getMessageById(id) {
        const [message] = await db.select().from(messages).where(eq(messages.id, id));
        return message;
    }
    async getNotificationsByUserId(userId, page = 1, limit = 20, filters) {
        const offset = (page - 1) * limit;
        const conds = [eq(notifications.userId, userId)];
        if (filters?.type)
            conds.push(eq(notifications.type, filters.type));
        if (typeof filters?.isRead === "boolean")
            conds.push(eq(notifications.isRead, filters.isRead));
        const notifs = await db.select().from(notifications).where(and(...conds)).orderBy(desc(notifications.createdAt)).limit(limit).offset(offset);
        const withMsg = await Promise.all(notifs.map(async (n) => {
            if (n.type === "new_message") {
                const [message] = await db.select().from(messages).where(and(eq(messages.receiverId, userId), sql `created_at >= ${n.createdAt}`)).orderBy(asc(messages.createdAt)).limit(1);
                return { ...n, messageId: message?.id };
            }
            return n;
        }));
        return withMsg;
    }
    async createNotification(notification) {
        const [newNotification] = await db.insert(notifications).values(notification).returning();
        return newNotification;
    }
    async markNotificationAsRead(notificationId) {
        await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
    }
    async markAllNotificationsAsRead(userId) {
        await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
    }
    async countUnreadNotifications(userId) {
        const [result] = await db.select({ count: sql `COUNT(*)` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
        return Number(result?.count || 0);
    }
    async getNotificationById(id) {
        const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
        return notification;
    }
    async createNotificationForNewMessage(message) {
        try {
            const [sender] = await db.select().from(users).where(eq(users.id, message.senderId));
            await db.insert(notifications).values({
                userId: message.receiverId,
                type: "new_message",
                title: "Nuevo mensaje recibido",
                message: `Tienes un nuevo mensaje de ${sender?.firstName || sender?.email || 'un usuario'}`,
                isRead: false,
                createdAt: new Date(),
                messageId: message.id,
            });
        }
        catch (err) {
            console.error("createNotificationForNewMessage error:", err);
        }
    }
    async createPayment(payment) {
        const now = new Date();
        const [newPayment] = await db.insert(payments).values({ ...payment, createdAt: now, updatedAt: now }).returning();
        return newPayment;
    }
    async updatePaymentStatus(orderId, status) {
        const [updatedPayment] = await db.update(payments).set({ status, updatedAt: new Date() }).where(eq(payments.orderId, orderId)).returning();
        return updatedPayment;
    }
    async getPaymentsByUser(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        return await db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.createdAt)).limit(limit).offset(offset);
    }
    async getPaymentByOrderId(orderId) {
        const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId));
        return payment;
    }
    async getUserStats(userId) {
        const [taskerTasks] = await db.select({ total: count(tasks.id), completed: sql `SUM(CASE WHEN ${tasks.status} = 'completed' THEN 1 ELSE 0 END)` }).from(tasks).where(eq(tasks.assignedTaskerId, userId));
        const [userInfo] = await db.select({ rating: users.rating, reviewCount: users.reviewCount }).from(users).where(eq(users.id, userId));
        return {
            totalTasks: Number(taskerTasks?.total) || 0,
            completedTasks: Number(taskerTasks?.completed) || 0,
            averageRating: Number(userInfo?.rating) || 0,
            reviewCount: userInfo?.reviewCount || 0,
        };
    }
    async getSessionById(sessionId) {
        const [sessionRow] = await db.select().from(sessions).where(eq(sessions.sid, sessionId));
        if (!sessionRow)
            return null;
        const sessData = sessionRow.sess;
        return { id: sessionRow.sid, userId: sessData.userId || null, expiresAt: sessionRow.expire };
    }
}
export const storage = new DatabaseStorage();
