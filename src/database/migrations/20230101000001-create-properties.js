module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Properties', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },

      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      category: {
        type: Sequelize.ENUM('shared_flat', 'sublet', 'student_housing'),
        allowNull: false,
      },

      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      postcode: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      latitude: {
        type: Sequelize.DECIMAL(8, 6),
        allowNull: true,
      },

      longitude: {
        type: Sequelize.DECIMAL(9, 6),
        allowNull: true,
      },

      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      bedrooms: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      bathrooms: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      size: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      amenities: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      image_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      available_from: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      available_to: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    await queryInterface.addIndex('Properties', ['owner_id'])
    await queryInterface.addIndex('Properties', ['city'])
    await queryInterface.addIndex('Properties', ['postcode'])
    await queryInterface.addIndex('Properties', ['category'])
    await queryInterface.addIndex('Properties', ['is_available'])
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('Properties', ['owner_id'])
    await queryInterface.removeIndex('Properties', ['city'])
    await queryInterface.removeIndex('Properties', ['postcode'])
    await queryInterface.removeIndex('Properties', ['category'])
    await queryInterface.removeIndex('Properties', ['is_available'])
    await queryInterface.dropTable('Properties')
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Properties_category"')
  },
}