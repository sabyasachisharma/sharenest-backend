"use strict"

const tableName = "Properties"

module.exports = {
  up: async queryInterface => {
    await queryInterface.removeColumn(tableName, "slug")
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(tableName, "slug", {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    })
  },
} 