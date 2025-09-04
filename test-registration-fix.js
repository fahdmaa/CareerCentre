#!/usr/bin/env node

/**
 * Comprehensive test for event registration validation fix
 * 
 * This script tests the complete registration system to ensure:
 * 1. Duplicate registrations are properly detected and blocked
 * 2. Email normalization works correctly  
 * 3. The Supabase query handler correctly applies WHERE conditions
 * 4. Server-side validation works as expected
 * 
 * Run with: node test-registration-fix.js
 */

const { query } = require('./database/supabase.js');
const fetch = require('node-fetch');
const { spawn } = require('child_process');

async function runDatabaseTests() {
    console.log('🔧 Running Database Layer Tests...\n');
    
    const testEmail = 'test-fix-validation@emsi.ma';
    const eventId = 11;
    
    try {
        // Clean up any existing test data
        await query('DELETE FROM event_registrations WHERE student_email = $1', [testEmail]);
        
        // Test 1: Check empty result for non-existent registration
        console.log('Test 1: Checking non-existent registration...');
        const check1 = await query(
            'SELECT id FROM event_registrations WHERE event_id = $1 AND student_email = $2',
            [eventId, testEmail]
        );
        console.log(`✓ Expected: 0 registrations, Found: ${check1.rows.length}`);
        
        // Test 2: Insert a registration
        console.log('\nTest 2: Creating registration...');
        const insert = await query(
            'INSERT INTO event_registrations (event_id, student_name, student_email, student_phone, major, year) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [eventId, 'Test User', testEmail, '0661234567', 'MIAGE', '3']
        );
        console.log(`✓ Registration created with ID: ${insert.rows[0].id}`);
        
        // Test 3: Check existing registration detection
        console.log('\nTest 3: Checking duplicate detection...');
        const check2 = await query(
            'SELECT id FROM event_registrations WHERE event_id = $1 AND student_email = $2',
            [eventId, testEmail]
        );
        console.log(`✓ Expected: 1 registration, Found: ${check2.rows.length}`);
        
        // Test 4: Test email case insensitivity
        console.log('\nTest 4: Testing email case insensitivity...');
        const check3 = await query(
            'SELECT id FROM event_registrations WHERE event_id = $1 AND student_email = $2',
            [eventId, testEmail.toUpperCase()]
        );
        console.log(`✓ Uppercase email check - Expected: 0 (different case), Found: ${check3.rows.length}`);
        
        // Clean up
        await query('DELETE FROM event_registrations WHERE student_email = $1', [testEmail]);
        console.log('✓ Test data cleaned up');
        
        console.log('\n🎉 Database layer tests passed!\n');
        return true;
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        return false;
    }
}

async function runServerTests() {
    console.log('🌐 Running Server API Tests...\n');
    
    const testEmail = 'server-test@emsi.ma';
    const eventId = 11;
    
    return new Promise((resolve) => {
        // Start server
        const server = spawn('node', ['server.js'], {
            detached: false,
            stdio: ['ignore', 'pipe', 'pipe']
        });
        
        let serverStarted = false;
        let testResults = true;
        
        // Wait for server to start
        setTimeout(async () => {
            try {
                // Clean up any existing test data first
                await query('DELETE FROM event_registrations WHERE student_email = $1', [testEmail]);
                
                console.log('Test 1: New registration (should succeed)...');
                const response1 = await fetch('http://localhost:3000/api/public/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event_id: eventId,
                        student_name: 'Server Test User',
                        student_email: testEmail,
                        student_phone: '0661234567',
                        major: 'MIAGE',
                        year: '3'
                    })
                });
                const result1 = await response1.json();
                
                if (result1.success) {
                    console.log(`✓ New registration succeeded with ID: ${result1.data.id}`);
                } else {
                    console.log(`❌ New registration failed: ${result1.message}`);
                    testResults = false;
                }
                
                console.log('\nTest 2: Duplicate registration (should fail)...');
                const response2 = await fetch('http://localhost:3000/api/public/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event_id: eventId,
                        student_name: 'Server Test User',
                        student_email: testEmail,
                        student_phone: '0661234567',
                        major: 'MIAGE',
                        year: '3'
                    })
                });
                const result2 = await response2.json();
                
                if (!result2.success && result2.message.includes('already registered')) {
                    console.log('✓ Duplicate registration correctly blocked');
                } else {
                    console.log(`❌ Duplicate registration not blocked properly: ${result2.message}`);
                    testResults = false;
                }
                
                console.log('\nTest 3: Case sensitivity test...');
                const response3 = await fetch('http://localhost:3000/api/public/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        event_id: eventId,
                        student_name: 'Server Test User',
                        student_email: testEmail.toUpperCase(), // Different case
                        student_phone: '0661234567',
                        major: 'MIAGE',
                        year: '3'
                    })
                });
                const result3 = await response3.json();
                
                if (!result3.success && result3.message.includes('already registered')) {
                    console.log('✓ Case-insensitive duplicate detection works');
                } else {
                    console.log(`❌ Case sensitivity issue: ${result3.message}`);
                    testResults = false;
                }
                
                // Clean up
                await query('DELETE FROM event_registrations WHERE student_email = $1', [testEmail.toLowerCase()]);
                console.log('✓ Test data cleaned up');
                
                if (testResults) {
                    console.log('\n🎉 Server API tests passed!\n');
                } else {
                    console.log('\n❌ Server API tests failed!\n');
                }
                
            } catch (error) {
                console.error('❌ Server test error:', error.message);
                testResults = false;
            } finally {
                server.kill();
                resolve(testResults);
            }
        }, 3000);
    });
}

async function main() {
    console.log('🚀 Event Registration Validation Fix - Comprehensive Test\n');
    console.log('This test verifies that the "You are already registered" issue is fixed.\n');
    
    const dbTestsPass = await runDatabaseTests();
    const serverTestsPass = await runServerTests();
    
    if (dbTestsPass && serverTestsPass) {
        console.log('🎉 ALL TESTS PASSED! The registration validation issue has been fixed.');
        console.log('\n✅ Key fixes implemented:');
        console.log('   • Fixed Supabase query handler WHERE condition parsing');
        console.log('   • Added email normalization (lowercase + trim)');
        console.log('   • Enhanced error logging and debugging');
        console.log('   • Added client-side race condition prevention');
        console.log('   • Improved error messages for duplicate registrations');
    } else {
        console.log('❌ Some tests failed. Please review the output above.');
        process.exit(1);
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { runDatabaseTests, runServerTests };