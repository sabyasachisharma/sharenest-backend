module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PropertyImages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      property_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Properties',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      image_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      cloudinary_public_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    })

    await queryInterface.addIndex('PropertyImages', ['property_id'])
    await queryInterface.addIndex('PropertyImages', ['sort_order'])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('PropertyImages', ['property_id'])
    await queryInterface.removeIndex('PropertyImages', ['sort_order'])
    await queryInterface.dropTable('PropertyImages')
  },
} 