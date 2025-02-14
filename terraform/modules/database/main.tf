resource "azurerm_mysql_flexible_server" "main" {
  name                = "${var.project_name}-${var.environment}-mysql"
  resource_group_name = var.resource_group_name
  location            = var.location

  administrator_login    = var.admin_username
  administrator_password = var.admin_password

  sku_name                     = "B_Standard_B1ms"
  version                      = "8.0.21"
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
}

resource "azurerm_mysql_flexible_database" "main" {
  name                = "${var.project_name}_${var.environment}"
  resource_group_name = var.resource_group_name
  server_name         = azurerm_mysql_flexible_server.main.name
  charset             = "utf8mb4"
  collation          = "utf8mb4_unicode_ci"
}
