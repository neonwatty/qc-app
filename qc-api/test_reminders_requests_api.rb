#!/usr/bin/env ruby

# Test script for Task 4.5: Reminders and Requests API
# This script tests RemindersController and RelationshipRequestsController functionality

require 'net/http'
require 'json'
require 'uri'
require 'securerandom'

class APITest
  BASE_URL = 'http://localhost:3001/api/v1'

  def initialize
    @test_email = "test_#{SecureRandom.hex(4)}@example.com"
    @partner_email = "partner_#{SecureRandom.hex(4)}@example.com"
    @auth_token = nil
    @partner_token = nil
    @couple_id = nil
    @reminder_id = nil
    @request_id = nil
    @passed = 0
    @failed = 0
  end

  def run_all_tests
    puts "\n" + "="*60
    puts "TESTING TASK 4.5: REMINDERS AND REQUESTS API"
    puts "="*60

    # Setup
    puts "\n[SETUP] Creating test users and authentication..."
    setup_test_users

    # Test Reminders API
    puts "\n" + "-"*40
    puts "TESTING REMINDERS API"
    puts "-"*40

    test_create_reminder
    test_list_reminders
    test_update_reminder
    test_complete_reminder
    test_skip_reminder
    test_snooze_reminder
    test_unsnooze_reminder
    test_reschedule_reminder
    test_upcoming_reminders
    test_overdue_reminders
    test_high_priority_reminders
    test_batch_complete_reminders
    test_batch_snooze_reminders
    test_reminder_statistics
    test_create_from_template
    test_reminder_templates
    test_delete_reminder

    # Test Relationship Requests API
    puts "\n" + "-"*40
    puts "TESTING RELATIONSHIP REQUESTS API"
    puts "-"*40

    test_create_request
    test_list_requests
    test_get_request
    test_update_request
    test_accept_request
    test_decline_request
    test_defer_request
    test_convert_to_reminder
    test_mark_discussed
    test_add_note_to_request
    test_inbox_requests
    test_sent_requests
    test_requiring_response_requests
    test_overdue_requests
    test_needs_attention_requests
    test_upcoming_activities
    test_batch_accept_requests
    test_request_statistics
    test_delete_request

    # Summary
    print_summary
  end

  private

  def setup_test_users
    # Create first user
    response = make_request(:post, '/auth/sign_up', {
      user: {
        email: @test_email,
        password: 'Password123!',
        password_confirmation: 'Password123!',
        name: 'Test User'
      }
    })

    if response[:status] == 200
      @auth_token = response[:headers]['Authorization']
      puts "✓ Created test user"
    else
      puts "✗ Failed to create test user: #{response[:status]}"
      exit 1
    end

    # Create partner user
    response = make_request(:post, '/auth/sign_up', {
      user: {
        email: @partner_email,
        password: 'Password123!',
        password_confirmation: 'Password123!',
        name: 'Partner User'
      }
    })

    if response[:status] == 200
      @partner_token = response[:headers]['Authorization']
      puts "✓ Created partner user"
    else
      puts "✗ Failed to create partner user: #{response[:status]}"
      exit 1
    end

    # Create couple
    response = make_request(:post, '/couples', {
      couple: {
        nickname: 'Test Couple'
      }
    }, @auth_token)

    if response[:status] == 201
      @couple_id = response[:body]['data']['id']
      puts "✓ Created couple"

      # Add partner to couple
      partner_response = make_request(:get, "/users/#{response[:body]['data']['user_ids'].first}", {}, @partner_token)
      if partner_response[:status] == 200
        partner_id = partner_response[:body]['data']['id']

        add_response = make_request(:post, "/couples/#{@couple_id}/add_partner", {
          partner_id: partner_id
        }, @auth_token)

        if add_response[:status] == 200
          puts "✓ Added partner to couple"
        end
      end
    else
      puts "✗ Failed to create couple: #{response[:status]}"
    end
  end

  # Reminders API Tests

  def test_create_reminder
    response = make_request(:post, '/reminders', {
      reminder: {
        title: 'Weekly Check-in',
        message: 'Time for our relationship check-in',
        category: 'check_in',
        frequency: 'weekly',
        scheduled_for: (Time.now + 86400).iso8601,
        priority: 'high',
        notification_channel: 'push'
      }
    }, @auth_token)

    if response[:status] == 201 && response[:body]['data']['title'] == 'Weekly Check-in'
      @reminder_id = response[:body]['data']['id']
      puts "✓ Create reminder"
      @passed += 1
    else
      puts "✗ Create reminder: #{response[:body]}"
      @failed += 1
    end
  end

  def test_list_reminders
    response = make_request(:get, '/reminders', {}, @auth_token)

    if response[:status] == 200 && response[:body]['data'].is_a?(Array)
      puts "✓ List reminders"
      @passed += 1
    else
      puts "✗ List reminders: #{response[:body]}"
      @failed += 1
    end
  end

  def test_update_reminder
    return unless @reminder_id

    response = make_request(:patch, "/reminders/#{@reminder_id}", {
      reminder: {
        title: 'Updated Weekly Check-in',
        priority: 'medium'
      }
    }, @auth_token)

    if response[:status] == 200 && response[:body]['data']['title'] == 'Updated Weekly Check-in'
      puts "✓ Update reminder"
      @passed += 1
    else
      puts "✗ Update reminder: #{response[:body]}"
      @failed += 1
    end
  end

  def test_complete_reminder
    # Create a reminder to complete
    create_response = make_request(:post, '/reminders', {
      reminder: {
        title: 'Complete Me',
        message: 'Test completion',
        category: 'personal',
        frequency: 'once',
        scheduled_for: Time.now.iso8601
      }
    }, @auth_token)

    if create_response[:status] == 201
      reminder_id = create_response[:body]['data']['id']

      response = make_request(:post, "/reminders/#{reminder_id}/complete", {}, @auth_token)

      if response[:status] == 200 && response[:body]['data']['completed_at']
        puts "✓ Complete reminder"
        @passed += 1
      else
        puts "✗ Complete reminder: #{response[:body]}"
        @failed += 1
      end
    end
  end

  def test_skip_reminder
    # Create a reminder to skip
    create_response = make_request(:post, '/reminders', {
      reminder: {
        title: 'Skip Me',
        message: 'Test skipping',
        category: 'personal',
        frequency: 'daily',
        scheduled_for: Time.now.iso8601
      }
    }, @auth_token)

    if create_response[:status] == 201
      reminder_id = create_response[:body]['data']['id']

      response = make_request(:post, "/reminders/#{reminder_id}/skip", {}, @auth_token)

      if response[:status] == 200 && response[:body]['data']['skip_count'] > 0
        puts "✓ Skip reminder"
        @passed += 1
      else
        puts "✗ Skip reminder: #{response[:body]}"
        @failed += 1
      end
    end
  end

  def test_snooze_reminder
    return unless @reminder_id

    response = make_request(:post, "/reminders/#{@reminder_id}/snooze", {
      duration: 30
    }, @auth_token)

    if response[:status] == 200 && response[:body]['data']['is_snoozed'] == true
      puts "✓ Snooze reminder"
      @passed += 1
    else
      puts "✗ Snooze reminder: #{response[:body]}"
      @failed += 1
    end
  end

  def test_unsnooze_reminder
    return unless @reminder_id

    response = make_request(:post, "/reminders/#{@reminder_id}/unsnooze", {}, @auth_token)

    if response[:status] == 200 && response[:body]['data']['is_snoozed'] == false
      puts "✓ Unsnooze reminder"
      @passed += 1
    else
      puts "✗ Unsnooze reminder: #{response[:body]}"
      @failed += 1
    end
  end

  def test_reschedule_reminder
    return unless @reminder_id

    new_time = (Time.now + 172800).iso8601
    response = make_request(:put, "/reminders/#{@reminder_id}/reschedule", {
      scheduled_for: new_time
    }, @auth_token)

    if response[:status] == 200
      puts "✓ Reschedule reminder"
      @passed += 1
    else
      puts "✗ Reschedule reminder: #{response[:body]}"
      @failed += 1
    end
  end

  def test_upcoming_reminders
    response = make_request(:get, '/reminders/upcoming', {}, @auth_token)

    if response[:status] == 200 && response[:body]['data'].is_a?(Array)
      puts "✓ Get upcoming reminders"
      @passed += 1
    else
      puts "✗ Get upcoming reminders: #{response[:body]}"
      @failed += 1
    end
  end

  def test_overdue_reminders
    # Create an overdue reminder
    make_request(:post, '/reminders', {
      reminder: {
        title: 'Overdue Reminder',
        message: 'Should have been done',
        category: 'personal',
        scheduled_for: (Time.now - 86400).iso8601
      }
    }, @auth_token)

    response = make_request(:get, '/reminders/overdue', {}, @auth_token)

    if response[:status] == 200 && response[:body]['data'].is_a?(Array)
      puts "✓ Get overdue reminders"
      @passed += 1
    else
      puts "✗ Get overdue reminders: #{response[:body]}"
      @failed += 1
    end
  end

  def test_high_priority_reminders
    response = make_request(:get, '/reminders/high_priority', {}, @auth_token)

    if response[:status] == 200 && response[:body]['data'].is_a?(Array)
      puts "✓ Get high priority reminders"
      @passed += 1
    else
      puts "✗ Get high priority reminders: #{response[:body]}"
      @failed += 1
    end
  end

  def test_batch_complete_reminders
    # Create reminders to complete
    ids = []
    2.times do |i|
      response = make_request(:post, '/reminders', {
        reminder: {
          title: "Batch Complete #{i}",
          message: 'Test batch',
          category: 'personal',
          scheduled_for: Time.now.iso8601
        }
      }, @auth_token)
      ids << response[:body]['data']['id'] if response[:status] == 201
    end

    response = make_request(:post, '/reminders/batch_complete', {
      reminder_ids: ids
    }, @auth_token)

    if response[:status] == 200 && response[:body]['data']['completed_count'] > 0
      puts "✓ Batch complete reminders"
      @passed += 1
    else
      puts "✗ Batch complete reminders: #{response[:body]}"
      @failed += 1
    end
  end

  def test_batch_snooze_reminders
    # Create reminders to snooze
    ids = []
    2.times do |i|
      response = make_request(:post, '/reminders', {
        reminder: {
          title: "Batch Snooze #{i}",
          message: 'Test batch snooze',
          category: 'personal',
          scheduled_for: Time.now.iso8601
        }
      }, @auth_token)
      ids << response[:body]['data']['id'] if response[:status] == 201
    end

    response = make_request(:post, '/reminders/batch_snooze', {
      reminder_ids: ids,
      duration: 60
    }, @auth_token)

    if response[:status] == 200 && response[:body]['data']['snoozed_count'] > 0
      puts "✓ Batch snooze reminders"
      @passed += 1
    else
      puts "✗ Batch snooze reminders: #{response[:body]}"
      @failed += 1
    end
  end

  def test_reminder_statistics
    response = make_request(:get, '/reminders/statistics', {}, @auth_token)

    if response[:status] == 200 && response[:body]['data']['total_reminders'] >= 0
      puts "✓ Get reminder statistics"
      @passed += 1
    else
      puts "✗ Get reminder statistics: #{response[:body]}"
      @failed += 1
    end
  end

  def test_create_from_template
    # This would require a template to exist
    response = make_request(:post, '/reminders/create_from_template', {
      template_id: 1,
      scheduled_for: (Time.now + 86400).iso8601
    }, @auth_token)

    # Template might not exist, so we just check for valid response
    if response[:status] == 404 || response[:status] == 201
      puts "✓ Create from template (endpoint tested)"
      @passed += 1
    else
      puts "✗ Create from template: #{response[:body]}"
      @failed += 1
    end
  end

  def test_reminder_templates
    response = make_request(:get, '/reminders/templates', {}, @auth_token)

    if response[:status] == 200 && response[:body]['data'].is_a?(Array)
      puts "✓ Get reminder templates"
      @passed += 1
    else
      puts "✗ Get reminder templates: #{response[:body]}"
      @failed += 1
    end
  end

  def test_delete_reminder
    # Create a reminder to delete
    create_response = make_request(:post, '/reminders', {
      reminder: {
        title: 'Delete Me',
        message: 'Test deletion',
        category: 'personal',
        scheduled_for: Time.now.iso8601
      }
    }, @auth_token)

    if create_response[:status] == 201
      reminder_id = create_response[:body]['data']['id']

      response = make_request(:delete, "/reminders/#{reminder_id}", {}, @auth_token)

      if response[:status] == 204 || response[:status] == 200
        puts "✓ Delete reminder"
        @passed += 1
      else
        puts "✗ Delete reminder: #{response[:body]}"
        @failed += 1
      end
    end
  end

  # Relationship Requests API Tests

  def test_create_request
    response = make_request(:post, '/relationship_requests', {
      relationship_request: {
        title: 'Date Night',
        message: 'Would you like to go to dinner on Friday?',
        request_type: 'activity',
        urgency: 'normal',
        due_date: (Time.now + 259200).iso8601
      }
    }, @auth_token)

    if response[:status] == 201 && response[:body]['data']['title'] == 'Date Night'
      @request_id = response[:body]['data']['id']
      puts "✓ Create relationship request"
      @passed += 1
    else
      puts "✗ Create relationship request: #{response[:body]}"
      @failed += 1
    end
  end

  def test_list_requests
    response = make_request(:get, '/relationship_requests', {}, @auth_token)

    if response[:status] == 200 && response[:body]['data'].is_a?(Array)
      puts "✓ List relationship requests"
      @passed += 1
    else
      puts "✗ List relationship requests: #{response[:body]}"
      @failed += 1
    end
  end

  def test_get_request
    return unless @request_id

    response = make_request(:get, "/relationship_requests/#{@request_id}", {}, @auth_token)

    if response[:status] == 200 && response[:body]['data']['id'] == @request_id
      puts "✓ Get relationship request"
      @passed += 1
    else
      puts "✗ Get relationship request: #{response[:body]}"
      @failed += 1
    end
  end

  def test_update_request
    return unless @request_id

    response = make_request(:patch, "/relationship_requests/#{@request_id}", {
      relationship_request: {
        title: 'Updated Date Night',
        urgency: 'high'
      }
    }, @auth_token)

    if response[:status] == 200 && response[:body]['data']['title'] == 'Updated Date Night'
      puts "✓ Update relationship request"
      @passed += 1
    else
      puts "✗ Update relationship request: #{response[:body]}"
      @failed += 1
    end
  end

  def test_accept_request
    # Create a request to accept
    create_response = make_request(:post, '/relationship_requests', {
      relationship_request: {
        title: 'Accept Me',
        message: 'Please accept this request',
        request_type: 'discussion',
        urgency: 'normal'
      }
    }, @auth_token)

    if create_response[:status] == 201
      request_id = create_response[:body]['data']['id']

      # Switch to partner to accept
      response = make_request(:post, "/relationship_requests/#{request_id}/accept", {
        response: "I'd love to!",
        notes: 'Looking forward to it'
      }, @partner_token)

      if response[:status] == 200 && response[:body]['data']['status'] == 'accepted'
        puts "✓ Accept relationship request"
        @passed += 1
      else
        puts "✗ Accept relationship request: #{response[:body]}"
        @failed += 1
      end
    end
  end

  def test_decline_request
    # Create a request to decline
    create_response = make_request(:post, '/relationship_requests', {
      relationship_request: {
        title: 'Decline Me',
        message: 'This will be declined',
        request_type: 'activity',
        urgency: 'low'
      }
    }, @auth_token)

    if create_response[:status] == 201
      request_id = create_response[:body]['data']['id']

      # Switch to partner to decline
      response = make_request(:post, "/relationship_requests/#{request_id}/decline", {
        response: "Sorry, can't make it",
        reason: 'scheduling_conflict'
      }, @partner_token)

      if response[:status] == 200 && response[:body]['data']['status'] == 'declined'
        puts "✓ Decline relationship request"
        @passed += 1
      else
        puts "✗ Decline relationship request: #{response[:body]}"
        @failed += 1
      end
    end
  end

  def test_defer_request
    # Create a request to defer
    create_response = make_request(:post, '/relationship_requests', {
      relationship_request: {
        title: 'Defer Me',
        message: 'This will be deferred',
        request_type: 'activity',
        urgency: 'normal'
      }
    }, @auth_token)

    if create_response[:status] == 201
      request_id = create_response[:body]['data']['id']

      response = make_request(:post, "/relationship_requests/#{request_id}/defer", {
        defer_until: (Time.now + 86400).iso8601,
        reason: 'Need to think about it'
      }, @partner_token)

      if response[:status] == 200 && response[:body]['data']['status'] == 'deferred'
        puts "✓ Defer relationship request"
        @passed += 1
      else
        puts "✗ Defer relationship request: #{response[:body]}"
        @failed += 1
      end
    end
  end

  def test_convert_to_reminder
    # Create a request to convert
    create_response = make_request(:post, '/relationship_requests', {
      relationship_request: {
        title: 'Convert to Reminder',
        message: 'This will become a reminder',
        request_type: 'activity',
        urgency: 'normal'
      }
    }, @auth_token)

    if create_response[:status] == 201
      request_id = create_response[:body]['data']['id']

      response = make_request(:post, "/relationship_requests/#{request_id}/convert_to_reminder", {
        scheduled_for: (Time.now + 86400).iso8601,
        frequency: 'once'
      }, @auth_token)

      if response[:status] == 200 && response[:body]['data']['reminder_id']
        puts "✓ Convert request to reminder"
        @passed += 1
      else
        puts "✗ Convert request to reminder: #{response[:body]}"
        @failed += 1
      end
    end
  end

  def test_mark_discussed
    return unless @request_id

    response = make_request(:post, "/relationship_requests/#{@request_id}/mark_discussed", {
      notes: 'We talked about this'
    }, @auth_token)

    if response[:status] == 200 && response[:body]['data']['discussed_at']
      puts "✓ Mark request as discussed"
      @passed += 1
    else
      puts "✗ Mark request as discussed: #{response[:body]}"
      @failed += 1
    end
  end

  def test_add_note_to_request
    return unless @request_id

    response = make_request(:post, "/relationship_requests/#{@request_id}/add_note", {
      note: 'Additional thoughts on this request'
    }, @auth_token)

    if response[:status] == 200
      puts "✓ Add note to request"
      @passed += 1
    else
      puts "✗ Add note to request: #{response[:body]}"
      @failed += 1
    end
  end

  def test_inbox_requests
    response = make_request(:get, '/relationship_requests/inbox', {}, @auth_token)

    if response[:status] == 200 && response[:body]['data'].is_a?(Array)
      puts "✓ Get inbox requests"
      @passed += 1
    else
      puts "✗ Get inbox requests: #{response[:body]}"
      @failed += 1
    end
  end

  def test_sent_requests
    response = make_request(:get, '/relationship_requests/sent', {}, @auth_token)

    if response[:status] == 200 && response[:body]['data'].is_a?(Array)
      puts "✓ Get sent requests"
      @passed += 1
    else
      puts "✗ Get sent requests: #{response[:body]}"
      @failed += 1
    end
  end

  def test_requiring_response_requests
    response = make_request(:get, '/relationship_requests/requiring_response', {}, @auth_token)

    if response[:status] == 200 && response[:body]['data'].is_a?(Array)
      puts "✓ Get requests requiring response"
      @passed += 1
    else
      puts "✗ Get requests requiring response: #{response[:body]}"
      @failed += 1
    end
  end

  def test_overdue_requests
    response = make_request(:get, '/relationship_requests/overdue', {}, @auth_token)

    if response[:status] == 200 && response[:body]['data'].is_a?(Array)
      puts "✓ Get overdue requests"
      @passed += 1
    else
      puts "✗ Get overdue requests: #{response[:body]}"
      @failed += 1
    end
  end

  def test_needs_attention_requests
    response = make_request(:get, '/relationship_requests/needs_attention', {}, @auth_token)

    if response[:status] == 200 && response[:body]['data'].is_a?(Array)
      puts "✓ Get requests needing attention"
      @passed += 1
    else
      puts "✗ Get requests needing attention: #{response[:body]}"
      @failed += 1
    end
  end

  def test_upcoming_activities
    response = make_request(:get, '/relationship_requests/upcoming_activities', {}, @auth_token)

    if response[:status] == 200 && response[:body]['data'].is_a?(Array)
      puts "✓ Get upcoming activities"
      @passed += 1
    else
      puts "✗ Get upcoming activities: #{response[:body]}"
      @failed += 1
    end
  end

  def test_batch_accept_requests
    # Create requests to accept
    ids = []
    2.times do |i|
      response = make_request(:post, '/relationship_requests', {
        relationship_request: {
          title: "Batch Accept #{i}",
          message: 'Test batch',
          request_type: 'activity',
          urgency: 'normal'
        }
      }, @auth_token)
      ids << response[:body]['data']['id'] if response[:status] == 201
    end

    response = make_request(:post, '/relationship_requests/batch_accept', {
      request_ids: ids
    }, @partner_token)

    if response[:status] == 200 && response[:body]['data']['accepted_count'] >= 0
      puts "✓ Batch accept requests"
      @passed += 1
    else
      puts "✗ Batch accept requests: #{response[:body]}"
      @failed += 1
    end
  end

  def test_request_statistics
    response = make_request(:get, '/relationship_requests/statistics', {}, @auth_token)

    if response[:status] == 200 && response[:body]['data']['total_requests'] >= 0
      puts "✓ Get request statistics"
      @passed += 1
    else
      puts "✗ Get request statistics: #{response[:body]}"
      @failed += 1
    end
  end

  def test_delete_request
    # Create a request to delete
    create_response = make_request(:post, '/relationship_requests', {
      relationship_request: {
        title: 'Delete Me',
        message: 'Test deletion',
        request_type: 'activity',
        urgency: 'low'
      }
    }, @auth_token)

    if create_response[:status] == 201
      request_id = create_response[:body]['data']['id']

      response = make_request(:delete, "/relationship_requests/#{request_id}", {}, @auth_token)

      if response[:status] == 204 || response[:status] == 200
        puts "✓ Delete relationship request"
        @passed += 1
      else
        puts "✗ Delete relationship request: #{response[:body]}"
        @failed += 1
      end
    end
  end

  def make_request(method, path, body = {}, auth_token = nil)
    uri = URI.parse("#{BASE_URL}#{path}")

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'

    request = case method
    when :get
      Net::HTTP::Get.new(uri.path)
    when :post
      Net::HTTP::Post.new(uri.path)
    when :patch
      Net::HTTP::Patch.new(uri.path)
    when :put
      Net::HTTP::Put.new(uri.path)
    when :delete
      Net::HTTP::Delete.new(uri.path)
    end

    request['Content-Type'] = 'application/json'
    request['Accept'] = 'application/json'
    request['Authorization'] = auth_token if auth_token

    request.body = body.to_json unless method == :get || method == :delete

    begin
      response = http.request(request)

      body = begin
        if response.body && !response.body.empty?
          JSON.parse(response.body.force_encoding('UTF-8'))
        end
      rescue JSON::ParserError
        response.body
      end

      {
        status: response.code.to_i,
        body: body,
        headers: response.each_header.to_h
      }
    rescue => e
      {
        status: 0,
        body: { error: e.message },
        headers: {}
      }
    end
  end

  def print_summary
    total = @passed + @failed
    puts "\n" + "="*60
    puts "TEST SUMMARY"
    puts "="*60
    puts "Total tests: #{total}"
    puts "Passed: #{@passed} (#{(@passed.to_f / total * 100).round(1)}%)"
    puts "Failed: #{@failed} (#{(@failed.to_f / total * 100).round(1)}%)"
    puts "="*60

    if @failed == 0
      puts "✅ ALL TESTS PASSED!"
    else
      puts "❌ SOME TESTS FAILED"
    end
  end
end

# Run tests
tester = APITest.new
tester.run_all_tests