# Shore Agents Nurse Application Database

This directory contains the PostgreSQL database schema and related files for the Shore Agents Nurse Application.

## Files Overview

- `schema.sql` - Complete database schema with all tables, indexes, triggers, and views
- `seed_data.sql` - Sample data for development and testing
- `migrations/` - Database migration scripts for schema updates

## Database Schema Overview

The database contains the following main entities:

### Core Tables

1. **users** - User authentication and profile management
2. **clients** - Client companies receiving clinic services
3. **issuers** - Medicine/supply dispensing entities (pharmacies, departments)
4. **inventory_medicines** - Medicine inventory management
5. **inventory_supplies** - Medical supplies inventory management
6. **inventory_transactions** - Audit trail for inventory movements
7. **clinic_logs** - Patient visit records
8. **clinic_log_medicines** - Medicines dispensed per visit
9. **clinic_log_supplies** - Supplies used per visit
10. **reimbursements** - Employee medical reimbursement requests
11. **activity_items** - System activity logging
12. **app_settings** - Application configuration

### Key Features

- **UUID Primary Keys** - All tables use UUID for better scalability and security
- **Audit Trails** - Automatic timestamps and user tracking for all changes
- **Data Integrity** - Comprehensive foreign keys and check constraints
- **Performance** - Strategic indexes for common query patterns
- **Flexibility** - JSONB fields for metadata and extensible data

## Setup Instructions

### Prerequisites

- PostgreSQL 12 or higher
- UUID extension support
- PgCrypto extension support

### Installation Steps

1. **Create Database**
   ```sql
   CREATE DATABASE shoreagents_nurse;
   ```

2. **Run Schema**
   ```bash
   psql -U your_username -d shoreagents_nurse -f database/schema.sql
   ```

3. **Add Sample Data (Optional)**
   ```bash
   psql -U your_username -d shoreagents_nurse -f database/seed_data.sql
   ```

### Environment Variables

Set the following environment variables for database connection:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/shoreagents_nurse
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shoreagents_nurse
DB_USER=your_username
DB_PASSWORD=your_password
```

## Schema Details

### Comments and Documentation

Every table and column includes detailed comments explaining:
- Purpose and usage
- Data constraints and validation rules
- Relationships with other tables
- Business logic implications

### Indexes

Strategic indexes are created for:
- Primary and foreign key relationships
- Common search fields (names, dates, status)
- Performance-critical queries
- Audit and reporting needs

### Views

Pre-built views for common operations:
- `low_stock_medicines` - Medicines needing reorder or expiring soon
- `low_stock_supplies` - Supplies needing reorder or expiring soon
- `recent_clinic_activities` - Recent clinic visits with aggregated data
- `pending_reimbursements_summary` - Pending reimbursement statistics

### Triggers

Automatic triggers for:
- Updating `updated_at` timestamps
- Maintaining data integrity
- Activity logging

## Data Migration

When migrating from the current local storage system:

1. Export current data from local storage
2. Transform data to match schema structure
3. Use provided migration scripts in `migrations/` directory
4. Validate data integrity after migration

## Security Considerations

- All passwords are bcrypt hashed
- Role-based access control via user roles
- Audit trails for sensitive operations
- Input validation via database constraints

## Maintenance

### Regular Tasks

1. **Backup Database**
   ```bash
   pg_dump shoreagents_nurse > backup_$(date +%Y%m%d).sql
   ```

2. **Update Statistics**
   ```sql
   ANALYZE;
   ```

3. **Monitor Low Stock**
   ```sql
   SELECT * FROM low_stock_medicines;
   SELECT * FROM low_stock_supplies;
   ```

4. **Clean Old Activity Logs**
   ```sql
   DELETE FROM activity_items WHERE timestamp < NOW() - INTERVAL '1 year';
   ```

## Performance Monitoring

Key metrics to monitor:
- Query performance on large tables
- Index usage statistics
- Connection pool utilization
- Storage growth trends

## Support

For database-related issues:
1. Check PostgreSQL logs
2. Verify connection settings
3. Review constraint violations
4. Monitor disk space and performance

## Schema Evolution

When making schema changes:
1. Create migration script in `migrations/`
2. Test on development environment
3. Backup production data
4. Apply migration during maintenance window
5. Verify data integrity 