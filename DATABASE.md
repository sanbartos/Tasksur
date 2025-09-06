# Documentación de la Base de Datos

## Tablas

### users
- **id** (uuid): Identificador único del usuario (PK).
- **email** (text): Correo electrónico único.
- **first_name** (text): Nombre.
- **last_name** (text): Apellido.
- **profile_image_url** (text): URL de la foto de perfil.
- **phone** (text): Teléfono.
- **location** (text): Ubicación.
- **bio** (text): Biografía.
- **is_tasker** (boolean): Indica si es tasker.
- **rating** (real): Calificación promedio.
- **review_count** (int): Número de reseñas.
- **created_at** (timestamptz): Fecha de creación.

### tasks
- **id** (uuid): Identificador único de la tarea (PK).
- **client_id** (uuid): FK a users.id, cliente que creó la tarea.
- **title** (text): Título de la tarea.
- **description** (text): Descripción.
- **category_id** (uuid): FK a categorías.
- **budget** (numeric): Presupuesto.
- **location** (text): Ubicación.
- **status** (text): Estado (ej. open, closed).
- **created_at** (timestamptz): Fecha de creación.

### offers
- **id** (uuid): Identificador único de la oferta (PK).
- **task_id** (uuid): FK a tasks.id.
- **tasker_id** (uuid): FK a users.id, quien hace la oferta.
- **message** (text): Mensaje de la oferta.
- **status** (text): Estado (ej. pending, accepted).
- **created_at** (timestamptz): Fecha de creación.

### notifications
- **id** (uuid): Identificador único (PK).
- **user_id** (uuid): FK a users.id, destinatario.
- **title** (text): Título de la notificación.
- **message** (text): Mensaje.
- **is_read** (boolean): Leída o no.
- **created_at** (timestamptz): Fecha de creación.

## Vistas

### vw_tasks_with_offers
Vista que muestra tareas con conteo de ofertas.

### vw_user_profile
Vista que muestra perfil de usuario con estadísticas.

## Funciones y Triggers

- `notify_client_new_offer`: Crea notificación al cliente cuando hay nueva oferta.
- `notify_tasker_offer_accepted`: Notifica al tasker cuando su oferta es aceptada.
- `notify_user_new_message`: Notifica al usuario cuando recibe un mensaje.
- `notify_task_status_change`: Notifica al cliente cuando cambia el estado de la tarea.

---