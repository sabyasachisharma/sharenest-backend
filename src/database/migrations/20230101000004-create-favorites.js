module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Favorites', {
      userId: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      propertyId: {
        type: Sequelize.UUID,
        primaryKey: true,
        references: {
          model: 'Properties',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('Favorites');
  },
};