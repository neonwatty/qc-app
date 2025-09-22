class AddSessionTrackingToCheckIns < ActiveRecord::Migration[8.0]
  def change
    add_column :check_ins, :last_activity_at, :datetime
    add_column :check_ins, :last_updated_by, :integer
  end
end
