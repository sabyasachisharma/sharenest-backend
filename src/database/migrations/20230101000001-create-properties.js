module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Properties', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      ownerId: {
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
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      priceUnit: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'month',
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
      sizeUnit: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      availableFrom: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      availableTo: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      amenities: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      latitude: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      longitude: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Properties');
  },
};