import psycopg
from typing import List, Optional, Dict, Any

from .schemas import RoleCreate, RoleUpdate


def row_to_role_full(row: tuple, permissions: List[dict]) -> dict:
    return {
        "id": row[0],
        "name": row[1],
        "description": row[2] or "",
        "is_system": row[3] if len(row) > 3 else False,
        "permissions": permissions,
    }


def get_role_by_id(role_id: int, config) -> Optional[dict]:
    sql = 'SELECT id, name, description, is_system FROM role WHERE id = %s'
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (role_id,))
                row = cur.fetchone()
                if row is None:
                    return None
                perms = get_role_permissions(role_id, config)
                return row_to_role_full(row, perms)
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        raise Error


def get_all_roles(config) -> List[dict]:
    sql = "SELECT id, name, description, is_system FROM role ORDER BY id"
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                rows = cur.fetchall()
                result = []
                for row in rows:
                    perms = get_role_permissions(row[0], config)
                    result.append(row_to_role_full(row, perms))
                return result
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        raise Error


def get_role_permissions(role_id: int, config) -> List[dict]:
    sql = """SELECT p.id, p.code, p.name, p."group", p.description
             FROM permissions p
             JOIN role_permissions rp ON p.id = rp.permission_id
             WHERE rp.role_id = %s
             ORDER BY p."group", p.id"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (role_id,))
                return [
                    {
                        "id": r[0],
                        "code": r[1],
                        "name": r[2],
                        "group": r[3],
                        "description": r[4] or "",
                    }
                    for r in cur.fetchall()
                ]
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        return []


def get_all_permissions(config) -> List[dict]:
    sql = """SELECT id, code, name, "group", description FROM permissions ORDER BY "group", id"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                return [
                    {
                        "id": r[0],
                        "code": r[1],
                        "name": r[2],
                        "group": r[3],
                        "description": r[4] or "",
                    }
                    for r in cur.fetchall()
                ]
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        raise Error


def create_role(payload: RoleCreate, config) -> Optional[dict]:
    sql = """INSERT INTO role (name, description, is_system)
             VALUES (%s, %s, FALSE)
             RETURNING id"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (payload.name, payload.description or ""))
                new_id = cur.fetchone()[0]
                if payload.permission_ids:
                    for perm_id in payload.permission_ids:
                        cur.execute(
                            "INSERT INTO role_permissions (role_id, permission_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                            (new_id, perm_id),
                        )
                conn.commit()
                return get_role_by_id(new_id, config)
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        raise Error


def update_role(role_id: int, payload: RoleUpdate, config) -> Optional[dict]:
    fields = []
    values = []
    if payload.name is not None:
        fields.append("name = %s")
        values.append(payload.name)
    if payload.description is not None:
        fields.append("description = %s")
        values.append(payload.description)

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                if fields:
                    sql = f"UPDATE role SET {', '.join(fields)} WHERE id = %s"
                    values.append(role_id)
                    cur.execute(sql, tuple(values))

                if payload.permission_ids is not None:
                    cur.execute("DELETE FROM role_permissions WHERE role_id = %s", (role_id,))
                    for perm_id in payload.permission_ids:
                        cur.execute(
                            "INSERT INTO role_permissions (role_id, permission_id) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                            (role_id, perm_id),
                        )

                conn.commit()
                return get_role_by_id(role_id, config)
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        raise Error


def delete_role(role_id: int, config) -> bool:
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute("UPDATE users SET role = 1 WHERE role = %s", (role_id,))
                cur.execute("DELETE FROM role_permissions WHERE role_id = %s", (role_id,))
                cur.execute("DELETE FROM role WHERE id = %s", (role_id,))
                conn.commit()
                return cur.rowcount > 0
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        raise Error


def role_name_exists(name: str, config, exclude_id: Optional[int] = None) -> bool:
    sql = "SELECT id FROM role WHERE name = %s"
    params = [name]
    if exclude_id is not None:
        sql += " AND id != %s"
        params.append(exclude_id)
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, tuple(params))
                return cur.fetchone() is not None
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        return False


def seed_default_permissions(config):
    permissions = [
        ("user.view", "Lihat User", "User", "Melihat daftar user"),
        ("user.create", "Tambah User", "User", "Menambahkan user baru"),
        ("user.edit", "Edit User", "User", "Mengedit data user"),
        ("user.delete", "Hapus User", "User", "Menghapus user"),
        ("role.view", "Lihat Role", "Role", "Melihat daftar role"),
        ("role.create", "Tambah Role", "Role", "Menambahkan role baru"),
        ("role.edit", "Edit Role", "Role", "Mengedit role dan permission"),
        ("role.delete", "Hapus Role", "Role", "Menghapus role"),
        ("kampus.view", "Lihat Kampus", "Kampus", "Melihat daftar kampus"),
        ("kampus.create", "Tambah Kampus", "Kampus", "Menambahkan kampus baru"),
        ("kampus.edit", "Edit Kampus", "Kampus", "Mengedit data kampus"),
        ("kampus.delete", "Hapus Kampus", "Kampus", "Menghapus kampus"),
        ("unit.view", "Lihat Unit", "Unit", "Melihat daftar unit"),
        ("unit.create", "Tambah Unit", "Unit", "Menambahkan unit baru"),
        ("unit.edit", "Edit Unit", "Unit", "Mengedit data unit"),
        ("unit.delete", "Hapus Unit", "Unit", "Menghapus unit"),
        ("gedung.view", "Lihat Gedung", "Gedung", "Melihat daftar gedung"),
        ("gedung.create", "Tambah Gedung", "Gedung", "Menambahkan gedung baru"),
        ("gedung.edit", "Edit Gedung", "Gedung", "Mengedit data gedung"),
        ("gedung.delete", "Hapus Gedung", "Gedung", "Menghapus gedung"),
        ("device.view", "Lihat Perangkat", "Perangkat", "Melihat daftar perangkat"),
        ("device.create", "Tambah Perangkat", "Perangkat", "Menambahkan perangkat baru"),
        ("device.edit", "Edit Perangkat", "Perangkat", "Mengedit data perangkat"),
        ("device.delete", "Hapus Perangkat", "Perangkat", "Menghapus perangkat"),
        ("data.view", "Lihat Data", "Data", "Melihat data monitoring"),
        ("data.export", "Export Data", "Data", "Mengexport data"),
        ("powermeter.view", "Lihat Powermeter", "Powermeter", "Melihat daftar powermeter"),
        ("powermeter.create", "Tambah Powermeter", "Powermeter", "Menambahkan powermeter baru"),
        ("powermeter.edit", "Edit Powermeter", "Powermeter", "Mengedit data powermeter"),
        ("powermeter.delete", "Hapus Powermeter", "Powermeter", "Menghapus powermeter"),
        ("tarif.view", "Lihat Tarif", "Tarif", "Melihat tarif listrik"),
        ("tarif.edit", "Edit Tarif", "Tarif", "Mengedit tarif listrik"),
        ("system.settings", "Pengaturan Sistem", "Sistem", "Akses pengaturan sistem"),
    ]

    sql_check = "SELECT id FROM permissions WHERE code = %s"
    sql_insert = """INSERT INTO permissions (code, name, "group", description)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (code) DO NOTHING RETURNING id"""

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                for code, name, group, desc in permissions:
                    cur.execute(sql_check, (code,))
                    if cur.fetchone() is None:
                        cur.execute(sql_insert, (code, name, group, desc))
                conn.commit()
    except (Exception, psycopg.DatabaseError) as Error:
        print("Seed permissions error:", Error)


def assign_all_permissions_to_admin(config):
    sql_role = "SELECT id FROM role WHERE LOWER(name) = 'admin'"
    sql_perms = "SELECT id FROM permissions"
    sql_insert = "INSERT INTO role_permissions (role_id, permission_id) VALUES (%s, %s) ON CONFLICT DO NOTHING"

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql_role)
                role = cur.fetchone()
                if role is None:
                    cur.execute("INSERT INTO role (name, description, is_system) VALUES ('Admin', 'Administrator sistem dengan akses penuh', TRUE) RETURNING id")
                    role = cur.fetchone()
                role_id = role[0]
                cur.execute(sql_perms)
                for perm in cur.fetchall():
                    cur.execute(sql_insert, (role_id, perm[0]))
                conn.commit()
    except (Exception, psycopg.DatabaseError) as Error:
        print("Assign admin permissions error:", Error)
