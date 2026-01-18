-- SQL para verificar y actualizar el rol de usuario

-- Verificar el rol actual del usuario
SELECT id, email, full_name, role, created_at
FROM users
WHERE email = 'diego.merclib@gmail.com';

-- Si el rol no es 'admin', ejecuta esta consulta para actualizarlo:
UPDATE users
SET role = 'admin'
WHERE email = 'diego.merclib@gmail.com';

-- Verificar que se actualizó correctamente
SELECT id, email, full_name, role, created_at
FROM users
WHERE email = 'diego.merclib@gmail.com';
