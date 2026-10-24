SELECT defaclrole::regrole::text AS grantor_role,
       defaclnamespace::regnamespace::text AS schema_name,
       defaclobjtype,
       defaclacl::text AS acl
FROM pg_default_acl
WHERE defaclnamespace = 'public'::regnamespace;
