module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PropertyImages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      propertyId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Properties',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      displayOrder: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    await queryInterface.dropTable('PropertyImages');
  },
};