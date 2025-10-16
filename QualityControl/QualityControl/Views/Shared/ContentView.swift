//
//  ContentView.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import SwiftUI
import SwiftData

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var users: [User]

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "heart.circle.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.pink)

                Text("Quality Control")
                    .font(.largeTitle)
                    .fontWeight(.bold)

                Text("Relationship Check-in App")
                    .font(.subheadline)
                    .foregroundColor(.secondary)

                Spacer()

                if users.isEmpty {
                    Text("No users yet")
                        .font(.caption)
                        .foregroundColor(.secondary)
                } else {
                    Text("\(users.count) user(s) in database")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }

                Text("Week 1: Foundation Setup")
                    .font(.caption2)
                    .foregroundColor(.gray)
                    .padding(.bottom, 40)
            }
            .padding()
            .navigationTitle("QC")
        }
    }
}

#Preview {
    ContentView()
        .modelContainer(for: User.self, inMemory: true)
}
