require 'rails_helper'

RSpec.describe NoteSerializer do
  let(:couple) { create(:couple) }
  let(:author) { create(:user, couple: couple) }
  let(:partner) { create(:user, couple: couple) }
  let(:other_user) { create(:user) }
  let(:check_in) { create(:check_in, couple: couple) }
  let(:category) { create(:category, couple: couple) }

  let(:private_note) do
    create(:note,
      content: "This is private content",
      privacy: 'private',
      author: author,
      check_in: check_in,
      category: category,
      tags: ['personal', 'private'],
      is_favorite: true
    )
  end

  let(:shared_note) do
    create(:note,
      content: "This is shared content",
      privacy: 'shared',
      author: author,
      check_in: check_in,
      category: category,
      tags: ['relationship', 'shared'],
      published_at: Time.current,
      first_shared_at: Time.current
    )
  end

  let(:draft_note) do
    create(:note,
      content: "This is draft content",
      privacy: 'draft',
      author: author,
      check_in: check_in,
      category: category,
      tags: ['work-in-progress']
    )
  end

  describe 'privacy-aware content exposure' do
    context 'when current user is the author' do
      let(:serialization) { NoteSerializer.new(private_note, params: { current_user: author }).serializable_hash }
      let(:attributes) { serialization[:data][:attributes] }

      it 'shows full content for private notes' do
        expect(attributes[:content]).to eq("This is private content")
      end

      it 'shows tags' do
        expect(attributes[:tags]).to eq(['personal', 'private'])
      end

      it 'shows favorite status' do
        expect(attributes[:is_favorite]).to eq(true)
      end

      it 'shows author name' do
        expect(attributes[:author_name]).to eq(author.name)
      end

      it 'shows can_edit as true' do
        expect(attributes[:can_edit]).to eq(true)
      end

      it 'shows can_view as true' do
        expect(attributes[:can_view]).to eq(true)
      end

      it 'shows metadata' do
        expect(attributes[:word_count]).not_to be_nil
        expect(attributes[:reading_time_minutes]).not_to be_nil
      end
    end

    context 'when current user is the partner' do
      context 'viewing shared note' do
        let(:serialization) { NoteSerializer.new(shared_note, params: { current_user: partner }).serializable_hash }
        let(:attributes) { serialization[:data][:attributes] }

        it 'shows full content for shared notes' do
          expect(attributes[:content]).to eq("This is shared content")
        end

        it 'shows tags' do
          expect(attributes[:tags]).to eq(['relationship', 'shared'])
        end

        it 'does not show favorite status (author only)' do
          expect(attributes[:is_favorite]).to be_nil
        end

        it 'shows author name' do
          expect(attributes[:author_name]).to eq(author.name)
        end

        it 'shows can_edit as false' do
          expect(attributes[:can_edit]).to eq(false)
        end

        it 'shows can_view as true' do
          expect(attributes[:can_view]).to eq(true)
        end

        it 'shows publishing timestamps' do
          expect(attributes[:published_at]).not_to be_nil
          expect(attributes[:first_shared_at]).not_to be_nil
        end
      end

      context 'viewing private note' do
        let(:serialization) { NoteSerializer.new(private_note, params: { current_user: partner }).serializable_hash }
        let(:attributes) { serialization[:data][:attributes] }

        it 'masks content for private notes' do
          expect(attributes[:content]).to eq("[Private Note]")
        end

        it 'hides tags' do
          expect(attributes[:tags]).to eq([])
        end

        it 'does not show favorite status' do
          expect(attributes[:is_favorite]).to be_nil
        end

        it 'shows author name (partner can see)' do
          expect(attributes[:author_name]).to eq(author.name)
        end

        it 'shows can_edit as false' do
          expect(attributes[:can_edit]).to eq(false)
        end

        it 'shows can_view as false' do
          expect(attributes[:can_view]).to eq(false)
        end

        it 'hides metadata' do
          expect(attributes[:word_count]).to be_nil
          expect(attributes[:reading_time_minutes]).to be_nil
        end
      end

      context 'viewing draft note' do
        let(:serialization) { NoteSerializer.new(draft_note, params: { current_user: partner }).serializable_hash }
        let(:attributes) { serialization[:data][:attributes] }

        it 'masks content for draft notes' do
          expect(attributes[:content]).to eq("[Draft]")
        end

        it 'hides tags' do
          expect(attributes[:tags]).to eq([])
        end

        it 'shows author name' do
          expect(attributes[:author_name]).to eq(author.name)
        end

        it 'shows can_edit as false' do
          expect(attributes[:can_edit]).to eq(false)
        end

        it 'shows can_view as false' do
          expect(attributes[:can_view]).to eq(false)
        end
      end
    end

    context 'when current user is not in the couple' do
      let(:serialization) { NoteSerializer.new(shared_note, params: { current_user: other_user }).serializable_hash }
      let(:attributes) { serialization[:data][:attributes] }

      it 'shows default content for shared notes (public)' do
        expect(attributes[:content]).to eq("This is shared content")
      end

      it 'hides tags' do
        expect(attributes[:tags]).to eq([])
      end

      it 'shows author name for shared notes' do
        expect(attributes[:author_name]).to eq(author.name)
      end

      it 'shows can_edit as false' do
        expect(attributes[:can_edit]).to eq(false)
      end

      it 'shows can_view as false' do
        expect(attributes[:can_view]).to eq(false)
      end
    end

    context 'when no current user provided' do
      let(:serialization) { NoteSerializer.new(private_note).serializable_hash }
      let(:attributes) { serialization[:data][:attributes] }

      it 'masks private content' do
        expect(attributes[:content]).to eq("[Private Note]")
      end

      it 'hides tags' do
        expect(attributes[:tags]).to eq([])
      end

      it 'shows Anonymous for author' do
        expect(attributes[:author_name]).to eq("Anonymous")
      end

      it 'shows can_edit as false' do
        expect(attributes[:can_edit]).to eq(false)
      end

      it 'shows can_view as false' do
        expect(attributes[:can_view]).to eq(false)
      end
    end
  end

  describe 'privacy status attributes' do
    let(:serialization) { NoteSerializer.new(private_note).serializable_hash }
    let(:attributes) { serialization[:data][:attributes] }

    it 'includes privacy boolean flags' do
      expect(attributes[:is_private]).to eq(true)
      expect(attributes[:is_shared]).to eq(false)
      expect(attributes[:is_draft]).to eq(false)
    end
  end

  describe 'core attributes' do
    let(:serialization) { NoteSerializer.new(shared_note).serializable_hash }
    let(:attributes) { serialization[:data][:attributes] }

    it 'always includes core attributes' do
      expect(attributes[:id]).to eq(shared_note.id)
      expect(attributes[:privacy]).to eq('shared')
      expect(attributes[:created_at]).not_to be_nil
      expect(attributes[:updated_at]).not_to be_nil
      expect(attributes[:author_id]).to eq(author.id)
      expect(attributes[:category_id]).to eq(category.id)
      expect(attributes[:check_in_id]).to eq(check_in.id)
    end
  end

  describe 'conditional relationship loading' do
    context 'with include_author param' do
      let(:serialization) do
        NoteSerializer.new(
          shared_note,
          params: { current_user: partner, include_author: true }
        ).serializable_hash
      end

      it 'includes author relationship for shared notes' do
        expect(serialization[:data][:relationships]).to have_key(:author)
      end
    end

    context 'with include_comments param for authorized user' do
      let(:serialization) do
        NoteSerializer.new(
          shared_note,
          params: { current_user: partner, include_comments: true }
        ).serializable_hash
      end

      it 'includes comments relationship' do
        expect(serialization[:data][:relationships]).to have_key(:comments)
      end
    end

    context 'with include_comments param for unauthorized user' do
      let(:serialization) do
        NoteSerializer.new(
          private_note,
          params: { current_user: other_user, include_comments: true }
        ).serializable_hash
      end

      it 'does not include comments relationship' do
        expect(serialization[:data][:relationships]).not_to have_key(:comments) if serialization[:data][:relationships]
      end
    end
  end

  describe 'camelCase output' do
    let(:serialization) { NoteSerializer.new(shared_note).serializable_hash }
    let(:attributes) { serialization[:data][:attributes] }

    it 'uses camelCase for attribute keys' do
      expect(attributes).to have_key(:created_at)
      expect(attributes).to have_key(:updated_at)
      expect(attributes).to have_key(:author_id)
      expect(attributes).to have_key(:category_id)
      expect(attributes).to have_key(:check_in_id)
      expect(attributes).to have_key(:is_private)
      expect(attributes).to have_key(:is_shared)
      expect(attributes).to have_key(:is_draft)
    end
  end
end