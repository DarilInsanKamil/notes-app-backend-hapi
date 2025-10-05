/* eslint-disable indent */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const InvariantError = require('../../api/notes/exceptions/InvariantErrror');
const NotFounderror = require('../../api/notes/exceptions/NotFoundError');
const AuthenticationError = require('../../api/notes/exceptions/AuthenticationError');


class UserService {
    constructor() {
        this._pool = new Pool();
    }

    async addUser({ username, password, fullname }) {
        //verifikasi apakah user sudah ada
        await this.verifyNewUsername(username);
        const id = `user - ${nanoid(16)}`;
        //masukan data user baru
        const hashPassword = await bcrypt.hash(password, 10);
        const query = {
            text: 'INSERT INTO users VALUES ($1, $2, $3, $4) RETURNING id',
            values: [id, username, hashPassword, fullname]
        };
        const result = await this._pool.query(query);
        console.log(result);
        if (!result.rows.length) {
            throw new InvariantError('User gagal ditambahkan');
        }
        return result.rows[0].id;
    }

    async verifyNewUsername(username) {
        const query = {
            text: 'SELECT * FROM users WHERE username = $1',
            values: [username]
        };
        const result = await this._pool.query(query);
        if (result.rows.length > 0) {
            throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
        }
    }
    async getUserById(id) {
        const query = {
            text: 'SELECT * FROM users WHERE id = $1',
            values: [id]
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFounderror('User tidak ditemukan');
        }

        return result.rows[0];
    }

    async verifyUserCredential(username, password) {
        const query = {
            text: 'SELECT id, password FROM users WHERE username = $1',
            values: [username, password]
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }

        const { id, password: hashedPassword } = result.rows[0];
        const match = await bcrypt.compare(password, hashedPassword);

        if (!match) {
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }
        return id;
    }
}


module.exports = UserService;