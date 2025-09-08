const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
    console.error('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
    console.error('SUPABASE_ANON_KEY:', supabaseKey ? 'Set (length: ' + supabaseKey.length + ')' : 'Missing');
    throw new Error('Missing required Supabase environment variables');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: false // Since this is server-side
    },
    db: {
        schema: 'public'
    }
});

// Helper function to execute queries (compatible with existing PostgreSQL query function)
const query = async (text, params = []) => {
    try {
        const start = Date.now();
        const normalizedQuery = text.toLowerCase().trim();
        
        // Handle COUNT queries specifically (but not complex SELECT queries with COUNT)
        if (normalizedQuery.includes('count(*)') && !normalizedQuery.includes('from events e') && !normalizedQuery.includes('registered_count')) {
            return await handleCountQuery(text, params, start);
        }
        
        // Handle complex SELECT queries
        if (normalizedQuery.startsWith('select')) {
            return await handleSelectQuery(text, params, start);
        }
        
        // Handle INSERT queries
        if (normalizedQuery.startsWith('insert')) {
            return await handleInsertQuery(text, params, start);
        }
        
        // Handle UPDATE queries
        if (normalizedQuery.startsWith('update')) {
            return await handleUpdateQuery(text, params, start);
        }
        
        // Handle DELETE queries
        if (normalizedQuery.startsWith('delete')) {
            return await handleDeleteQuery(text, params, start);
        }
        
        throw new Error(`Unsupported query type: ${text}`);
        
    } catch (error) {
        console.error('Supabase query error:', error);
        throw error;
    }
};

// Handle COUNT queries
const handleCountQuery = async (text, params, start) => {
    const tableMatch = text.match(/from\s+(\w+)/i);
    if (!tableMatch) {
        throw new Error('Could not parse table name from query');
    }
    const tableName = tableMatch[1];
    
    let query_builder = supabase.from(tableName).select('*', { count: 'exact', head: true });
    
    // Apply WHERE conditions
    query_builder = applyWhereConditions(query_builder, text, params);
    
    const { error, count } = await query_builder;
    if (error) throw error;
    
    const duration = Date.now() - start;
    console.log('Executed Supabase COUNT query', { text, duration, count });
    
    return {
        rows: [{ count: count?.toString() || '0' }],
        rowCount: 1
    };
};

// Handle SELECT queries
const handleSelectQuery = async (text, params, start) => {
    console.log('DEBUG: Processing SELECT query:', text.substring(0, 100));
    
    // Handle complex queries with joins first
    if (text.includes('JOIN')) {
        console.log('DEBUG: Detected JOIN query, routing to complex handler');
        return await handleComplexSelectQuery(text, params, start);
    }
    
    if (text.includes('event_registrations') && text.includes('registered_count')) {
        console.log('DEBUG: Detected registered_count query, routing to complex handler');
        return await handleComplexSelectQuery(text, params, start);
    }
    
    const tableMatch = text.match(/from\s+(\w+)/i);
    if (!tableMatch) {
        throw new Error('Could not parse table name from query');
    }
    const tableName = tableMatch[1];
    
    let query_builder = supabase.from(tableName).select('*');
    
    // Apply WHERE conditions
    query_builder = applyWhereConditions(query_builder, text, params);
    
    // Handle ORDER BY
    if (text.includes('ORDER BY')) {
        const orderMatch = text.match(/ORDER BY\s+([\w.]+)\s+(ASC|DESC)?/i);
        if (orderMatch) {
            const column = orderMatch[1];
            const ascending = orderMatch[2]?.toLowerCase() !== 'desc';
            query_builder = query_builder.order(column, { ascending });
        }
    }
    
    const { data, error } = await query_builder;
    if (error) throw error;
    
    const duration = Date.now() - start;
    console.log('Executed Supabase SELECT query', { text, duration, rows: data?.length || 0 });
    
    return {
        rows: data || [],
        rowCount: data?.length || 0
    };
};

// Handle complex SELECT queries with joins
const handleComplexSelectQuery = async (text, params, start) => {
    // Special handling for events with registration count
    if (text.includes('event_registrations') && text.includes('registered_count')) {
        try {
            // Get events with status filter
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('status', params[0] || 'upcoming')
                .order('event_date', { ascending: true });
                
            if (error) throw error;
            
            // For each event, get the registration count separately
            const eventsWithCounts = await Promise.all(
                data.map(async (event) => {
                    const { count, error: countError } = await supabase
                        .from('event_registrations')
                        .select('*', { count: 'exact', head: true })
                        .eq('event_id', event.id);
                        
                    return {
                        ...event,
                        registered_count: countError ? 0 : (count || 0)
                    };
                })
            );
            
            const duration = Date.now() - start;
            console.log('Executed Supabase complex SELECT query', { text, duration, rows: eventsWithCounts.length });
            
            return {
                rows: eventsWithCounts,
                rowCount: eventsWithCounts.length
            };
        } catch (error) {
            console.error('Complex query error:', error);
            throw error;
        }
    }
    
    // Special handling for registrations with event details JOIN
    if (text.includes('FROM event_registrations er') && text.includes('JOIN events e')) {
        try {
            // Get all registrations
            const { data: registrations, error: regError } = await supabase
                .from('event_registrations')
                .select('*')
                .order('registration_date', { ascending: false });
                
            if (regError) throw regError;
            
            // Get all events
            const { data: events, error: eventsError } = await supabase
                .from('events')
                .select('*');
                
            if (eventsError) throw eventsError;
            
            // Join the data manually
            const joinedData = registrations.map(reg => {
                const event = events.find(e => e.id === reg.event_id);
                return {
                    ...reg,
                    event_title: event?.title || 'Unknown Event',
                    event_date: event?.event_date || null,
                    event_location: event?.location || null,
                    event_capacity: event?.capacity || null
                };
            });
            
            const duration = Date.now() - start;
            console.log('Executed Supabase registrations JOIN query', { text, duration, rows: joinedData.length });
            
            return {
                rows: joinedData,
                rowCount: joinedData.length
            };
        } catch (error) {
            console.error('Registrations JOIN query error:', error);
            throw error;
        }
    }
    
    // Special handling for cohort applications with cohort details JOIN
    if (text.includes('FROM cohort_applications ca') && text.includes('JOIN cohorts c')) {
        try {
            // Get all cohort applications
            const { data: applications, error: appError } = await supabase
                .from('cohort_applications')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (appError) throw appError;
            
            // Get all cohorts
            const { data: cohorts, error: cohortsError } = await supabase
                .from('cohorts')
                .select('*');
                
            if (cohortsError) throw cohortsError;
            
            // Join the data manually
            const joinedData = applications.map(app => {
                const cohort = cohorts.find(c => c.id === app.cohort_id);
                return {
                    ...app,
                    cohort_name: cohort?.name || 'Unknown Cohort',
                    application_deadline: cohort?.application_deadline || null
                };
            });
            
            const duration = Date.now() - start;
            console.log('Executed Supabase cohort applications JOIN query', { text, duration, rows: joinedData.length });
            
            return {
                rows: joinedData,
                rowCount: joinedData.length
            };
        } catch (error) {
            console.error('Cohort applications JOIN query error:', error);
            throw error;
        }
    }
    
    // For other complex queries, fall back to simple select without recursion
    const tableMatch = text.match(/from\s+(\w+)/i);
    if (!tableMatch) {
        throw new Error('Could not parse table name from query');
    }
    const tableName = tableMatch[1];
    
    let query_builder = supabase.from(tableName).select('*');
    
    // Apply WHERE conditions
    query_builder = applyWhereConditions(query_builder, text, params);
    
    // Handle ORDER BY
    if (text.includes('ORDER BY')) {
        const orderMatch = text.match(/ORDER BY\s+([\w.]+)\s+(ASC|DESC)?/i);
        if (orderMatch) {
            const column = orderMatch[1];
            const ascending = orderMatch[2]?.toLowerCase() !== 'desc';
            query_builder = query_builder.order(column, { ascending });
        }
    }
    
    const { data, error } = await query_builder;
    if (error) throw error;
    
    const duration = Date.now() - start;
    console.log('Executed Supabase complex SELECT query (fallback)', { text, duration, rows: data?.length || 0 });
    
    return {
        rows: data || [],
        rowCount: data?.length || 0
    };
};

// Apply WHERE conditions to query builder
const applyWhereConditions = (queryBuilder, text, params) => {
    if (!text.includes('WHERE') || params.length === 0) {
        return queryBuilder;
    }
    
    console.log('DEBUG: Applying WHERE conditions for query:', text.substring(0, 150));
    console.log('DEBUG: Parameters:', params);
    
    // Handle specific WHERE patterns (check more specific patterns first)
    if (text.includes('cohort_id = $1 AND student_email = $2')) {
        console.log('DEBUG: Applying cohort_id AND student_email filter');
        return queryBuilder.eq('cohort_id', params[0]).eq('student_email', params[1]);
    }
    if (text.includes('event_id = $1 AND student_email = $2')) {
        console.log('DEBUG: Applying event_id AND student_email filter');
        return queryBuilder.eq('event_id', params[0]).eq('student_email', params[1]);
    }
    if (text.includes('cohort_id = $1 AND status = $2')) {
        console.log('DEBUG: Applying cohort_id AND status filter');
        return queryBuilder.eq('cohort_id', params[0]).eq('status', params[1]);
    }
    if (text.includes('username = $1')) {
        console.log('DEBUG: Applying username filter');
        return queryBuilder.eq('username', params[0]);
    }
    if (text.includes('status = $1')) {
        console.log('DEBUG: Applying status filter');
        return queryBuilder.eq('status', params[0]);
    }
    // Check for exact " id = $1" pattern (with space before) to avoid matching "event_id = $1"
    if (text.includes(' id = $1')) {
        console.log('DEBUG: Applying id filter');
        return queryBuilder.eq('id', params[0]);
    }
    
    // Log if no pattern matches to help with debugging
    console.warn('Warning: No matching WHERE pattern found for query:', text.substring(0, 150));
    console.warn('Available patterns: event_id = $1 AND student_email = $2, username = $1, status = $1, id = $1');
    return queryBuilder;
};

// Handle INSERT queries
const handleInsertQuery = async (text, params, start) => {
    const tableMatch = text.match(/insert into\s+(\w+)/i);
    if (!tableMatch) {
        throw new Error('Could not parse table name from INSERT query');
    }
    const tableName = tableMatch[1];
    
    // Extract column names
    const columnsMatch = text.match(/\(([^)]+)\)\s+values/i);
    if (!columnsMatch) {
        throw new Error('Could not parse columns from INSERT query');
    }
    
    const columns = columnsMatch[1].split(',').map(col => col.trim());
    const data = {};
    
    columns.forEach((col, index) => {
        if (params[index] !== undefined) {
            // Handle empty strings for time fields
            if ((col === 'event_time' || col === 'time') && params[index] === '') {
                data[col] = null;
            } else if (params[index] === '') {
                // Handle other empty strings based on column type
                data[col] = null;
            } else {
                data[col] = params[index];
            }
        }
    });
    
    const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();
        
    if (error) throw error;
    
    const duration = Date.now() - start;
    console.log('Executed Supabase INSERT', { text, duration, rows: 1 });
    
    return {
        rows: [result],
        rowCount: 1
    };
};

// Handle UPDATE queries
const handleUpdateQuery = async (text, params, start) => {
    const tableMatch = text.match(/update\s+(\w+)/i);
    if (!tableMatch) {
        throw new Error('Could not parse table name from UPDATE query');
    }
    const tableName = tableMatch[1];
    
    // Parse SET clause - for ambassadors table, we don't actually need to parse the SET clause
    // since we're using hardcoded field mapping. Just validate it has SET and WHERE
    console.log('DEBUG: Parsing UPDATE query:', text);
    if (!text.toLowerCase().includes('set') || !text.toLowerCase().includes('where')) {
        throw new Error('Invalid UPDATE query format: ' + text.substring(0, 200));
    }
    
    // For messages table
    if (tableName === 'messages') {
        let updateData = {};
        
        // Parse UPDATE fields for messages table
        if (text.includes('status = $1')) {
            updateData.status = params[0];
        }
        
        // Always update updated_at if it's in the query
        if (text.includes('updated_at = CURRENT_TIMESTAMP')) {
            updateData.updated_at = new Date().toISOString();
        }
        
        let query_builder = supabase.from('messages').update(updateData);
        
        // Apply WHERE conditions for messages table
        if (text.includes('id = $2')) {
            query_builder = query_builder.eq('id', params[1]);
        }
        
        query_builder = query_builder.select();
        
        const { data, error } = await query_builder;
        
        if (error) {
            throw error;
        }
        
        const duration = Date.now() - start;
        console.log('Executed Supabase UPDATE', {
            text: text,
            duration: duration,
            rows: data ? data.length : 0
        });
        
        return {
            command: 'UPDATE',
            rows: data || [],
            rowCount: data ? data.length : 0
        };
    }
    
    // For ambassadors table
    if (tableName === 'ambassadors') {
        console.log('DEBUG: Ambassador UPDATE params:', params);
        console.log('DEBUG: Params length:', params.length);
        
        const updateData = {
            name: params[0],
            role: params[1],
            major: params[2],
            year: params[3],
            email: params[4],
            linkedin: params[5],
            bio: params[6],
            image_url: params[7],
            status: params[8],
            updated_at: new Date().toISOString()
        };
        
        console.log('DEBUG: Update data:', updateData);
        console.log('DEBUG: ID for where clause:', params[9]);
        
        const { data, error } = await supabase
            .from(tableName)
            .update(updateData)
            .eq('id', params[9])
            .select()
            .single();
            
        if (error) throw error;
        
        const duration = Date.now() - start;
        console.log('Executed Supabase UPDATE', { text, duration, rows: 1 });
        
        return {
            rows: data ? [data] : [],
            rowCount: data ? 1 : 0
        };
    }
    
    // For events table
    if (tableName === 'events') {
        const updateData = {
            title: params[0],
            description: params[1],
            event_date: params[2],
            event_time: params[3] === '' ? null : params[3],
            location: params[4],
            capacity: params[5],
            status: params[6]
        };
        
        const { data, error } = await supabase
            .from(tableName)
            .update(updateData)
            .eq('id', params[7])
            .select()
            .single();
            
        if (error) throw error;
        
        const duration = Date.now() - start;
        console.log('Executed Supabase UPDATE', { text, duration, rows: 1 });
        
        return {
            rows: data ? [data] : [],
            rowCount: data ? 1 : 0
        };
    }
    
    // For cohorts table
    if (tableName === 'cohorts') {
        const updateData = {
            name: params[0],
            description: params[1],
            start_date: params[2],
            end_date: params[3],
            application_deadline: params[4],
            max_participants: params[5],
            status: params[6],
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from(tableName)
            .update(updateData)
            .eq('id', params[7])
            .select()
            .single();
            
        if (error) throw error;
        
        const duration = Date.now() - start;
        console.log('Executed Supabase UPDATE', { text, duration, rows: 1 });
        
        return {
            rows: data ? [data] : [],
            rowCount: data ? 1 : 0
        };
    }
    
    // For cohort_applications table
    if (tableName === 'cohort_applications') {
        const updateData = {
            status: params[0],
            interview_score: params[1],
            interview_notes: params[2],
            admin_notes: params[3],
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from(tableName)
            .update(updateData)
            .eq('id', params[4])
            .select()
            .single();
            
        if (error) throw error;
        
        const duration = Date.now() - start;
        console.log('Executed Supabase UPDATE', { text, duration, rows: 1 });
        
        return {
            rows: data ? [data] : [],
            rowCount: data ? 1 : 0
        };
    }
    
    throw new Error(`UPDATE not implemented for table: ${tableName}`);
};

// Handle DELETE queries
const handleDeleteQuery = async (text, params, start) => {
    const tableMatch = text.match(/delete from\s+(\w+)/i);
    if (!tableMatch) {
        throw new Error('Could not parse table name from DELETE query');
    }
    const tableName = tableMatch[1];
    
    let query_builder = supabase.from(tableName).delete().select();
    
    // Apply WHERE conditions for DELETE queries
    if (text.includes('student_email = $1')) {
        query_builder = query_builder.eq('student_email', params[0]);
    } else if (text.includes(' id = $1')) {
        query_builder = query_builder.eq('id', params[0]);
    } else {
        // Default to id for backward compatibility
        query_builder = query_builder.eq('id', params[0]);
    }
    
    const { data, error } = await query_builder;
        
    if (error) throw error;
    
    const duration = Date.now() - start;
    console.log('Executed Supabase DELETE', { text, duration, rows: data?.length || 0 });
    
    return {
        rows: data || [],
        rowCount: data?.length || 0
    };
};

// Get client function (for compatibility)
const getClient = () => {
    return supabase;
};

// Test connection
const testConnection = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
            
        if (error && error.code === 'PGRST116') {
            console.log('✅ Connected to Supabase (tables need to be created)');
        } else if (error) {
            console.warn('⚠️ Connected to Supabase but got error:', error.message);
        } else {
            console.log('✅ Connected to Supabase database');
        }
    } catch (error) {
        console.error('❌ Failed to connect to Supabase:', error.message);
        // Don't exit, just log the error
    }
};

// Test connection on initialization (don't block server startup)
if (supabaseUrl && supabaseKey) {
    testConnection();
}

module.exports = {
    supabase,
    query,
    getClient,
    // Export pool as supabase for compatibility
    pool: supabase
};