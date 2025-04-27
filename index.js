const Ordering = require('./rules/ordering.js');
const ValidStorageSlot = require('./rules/valid-storage-slot.js');

module.exports = [
    Ordering,
    ValidStorageSlot
];
