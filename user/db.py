import psycopg
from typing import List, Optional, Tuple, Any

from .schemas import User, UserUpdate


def row_to_user_dict(row: Tuple[Any, ...]) -> dict:
    """Konversi row SELECT users JOIN role ke dictionary response."""
    return {
        "id": row[0],
        "full_name": row[1],
        "username": row[2],
        "email": row[3],
        "role": row[4],
        "role_name": row[5] or "Unknown",
    }


def get_user_by_username(username, config):
    sql = """SELECT u.id, u.full_name, u.username, u.email, u.password, u.role, r.name
             FROM users u
             LEFT JOIN role r ON u.role = r.id
             WHERE u.username = %s"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (username,))
                result = cur.fetchone()
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        result = None
    finally:
        return result


def get_user_by_id(user_id: int, config) -> Optional[dict]:
    sql = """SELECT u.id, u.full_name, u.username, u.email, u.role, r.name
             FROM users u
             LEFT JOIN role r ON u.role = r.id
             WHERE u.id = %s"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (user_id,))
                row = cur.fetchone()
                return row_to_user_dict(row) if row else None
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        return None


def get_user_by_email(email: str, config) -> Optional[Tuple[Any, ...]]:
    sql = """SELECT id FROM users WHERE email = %s"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (email,))
                return cur.fetchone()
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        return None


def insert_new_user(user: User, config) -> Optional[dict]:
    sql = """INSERT INTO users (full_name, username, email, password, role)
             VALUES(%s, %s, %s, %s, %s)
             RETURNING id"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    sql,
                    (user.full_name, user.username, user.email, user.password, user.role),
                )
                new_id = cur.fetchone()[0]
                conn.commit()
                return get_user_by_id(new_id, config)
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        raise Error


def get_all_users(config) -> List[dict]:
    sql = """SELECT u.id, u.full_name, u.username, u.email, u.role, r.name
             FROM users u
             LEFT JOIN role r ON u.role = r.id
             ORDER BY u.id"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                rows = cur.fetchall()
                return [row_to_user_dict(row) for row in rows]
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        raise Error


def update_user(user_id: int, payload: UserUpdate, config) -> Optional[dict]:
    fields = []
    values = []
    if payload.full_name is not None:
        fields.append("full_name = %s")
        values.append(payload.full_name)
    if payload.username is not None:
        fields.append("username = %s")
        values.append(payload.username)
    if payload.email is not None:
        fields.append("email = %s")
        values.append(payload.email)
    if payload.password is not None:
        fields.append("password = %s")
        values.append(payload.password)
    if payload.role is not None:
        fields.append("role = %s")
        values.append(payload.role)

    if not fields:
        return get_user_by_id(user_id, config)

    sql = f"""UPDATE users
              SET {', '.join(fields)}
              WHERE id = %s
              RETURNING id"""
    values.append(user_id)

    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, tuple(values))
                updated = cur.fetchone()
                conn.commit()
                if updated is None:
                    return None
                return get_user_by_id(updated[0], config)
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        raise Error


def delete_user(user_id: int, config) -> bool:
    sql = """DELETE FROM users WHERE id = %s"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (user_id,))
                conn.commit()
                return cur.rowcount > 0
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        raise Error


def get_roles(config) -> List[dict]:
    sql = """SELECT id, name FROM role ORDER BY id"""
    try:
        with psycopg.connect(**config) as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                return [{"id": row[0], "name": row[1]} for row in cur.fetchall()]
    except (Exception, psycopg.DatabaseError) as Error:
        print(Error)
        raise Error


def username_exists(username: str, config, exclude_id: Optional[int] = None) -> bool:
    sql = "SELECT id FROM users WHERE username = %s"
    params = [username]
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


def email_exists(email: str, config, exclude_id: Optional[int] = None) -> bool:
    sql = "SELECT id FROM users WHERE email = %s"
    params = [email]
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
