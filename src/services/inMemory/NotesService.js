const { nanoid } = require('nanoid');
const InvariantError = require('../../api/notes/exceptions/InvariantErrror');
const NotFounderror = require('../../api/notes/exceptions/NotFoundError');

class NotesService {
  constructor() {
    this._notes = [];

  }

  addNote({ title, body, tags }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newNote = {
      title, tags, body, id, createdAt, updatedAt,
    };

    this._notes.push(newNote);

    const isSuccess = this._notes.filter((note) => note.id === id).length > 0;

    if (!isSuccess) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    return id;
  }
  getNotes() {
    return this._notes;
  }
  getNoteById(id) {
    const note = this._notes.filter((n) => n.id === id)[0];
    if (!note) {
      throw new NotFounderror('Catatan tidak ditemukan');
    }
    return note;
  }
  editNoteById(id, { title, body, tags }) {
    const index = this._notes.findIndex((note) => note.id === id);
    if (index === -1) {
      throw new NotFounderror('Gagal memperbarui catatan. Id tidak ditemukan');
    }

    const updatedAt = new Date().toISOString();

    this._notes[index] = {
      ...this._notes[index],
      title,
      tags,
      body,
      updatedAt,
    };
  }
  deleteNoteById(id) {
    const index = this._notes.findIndex((note) => note.id === id);
    if (index === -1) {
      throw new NotFounderror('Catatan gagal dihapus. Id tidak ditemukan');
    }
    this._notes.splice(index, 1);
  }
}
module.exports = NotesService;