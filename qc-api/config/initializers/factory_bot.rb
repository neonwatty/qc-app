# Configure FactoryBot to only load factories from test directory
if defined?(FactoryBot)
  FactoryBot.definition_file_paths = ['test/factories']
end