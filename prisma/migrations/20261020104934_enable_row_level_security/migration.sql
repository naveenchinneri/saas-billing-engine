-- Enable RLS on multi-tenant sensitive tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_meters ENABLE ROW LEVEL SECURITY;

-- Policy for Invoices: restricts reads and writes to rows matching the session's tenant ID
CREATE POLICY tenant_isolation_invoices ON invoices
    AS RESTRICTIVE
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID)
    WITH CHECK (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);

-- Policy for Usage Meters
CREATE POLICY tenant_isolation_usage ON usage_meters
    AS RESTRICTIVE
    USING (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID)
    WITH CHECK (organization_id = NULLIF(current_setting('app.current_tenant_id', true), '')::UUID);