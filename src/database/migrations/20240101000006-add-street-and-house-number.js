module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Properties', 'street', {
      type: Sequelize.STRING,
      allowNull: true, // Allow null initially for existing records
    })

    await queryInterface.addColumn('Properties', 'house_number', {
      type: Sequelize.STRING,
      allowNull: true, // Allow null initially for existing records
    })

    // Add indexes for better performance on duplicate checks
    await queryInterface.addIndex('Properties', ['postcode', 'street', 'house_number'], {
      name: 'idx_properties_address_duplicate_check'
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Properties', 'idx_properties_address_duplicate_check')
    await queryInterface.removeColumn('Properties', 'house_number')
    await queryInterface.removeColumn('Properties', 'street')
  },
} 