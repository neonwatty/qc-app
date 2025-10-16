//
//  MainTabView.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import SwiftUI

struct MainTabView: View {
    @State private var selectedTab: Tab = .dashboard

    var body: some View {
        TabView(selection: $selectedTab) {
            // Dashboard Tab
            DashboardPlaceholderView()
                .tabItem {
                    Label("Dashboard", systemImage: "house.fill")
                }
                .tag(Tab.dashboard)

            // Check-in Tab
            CheckInPlaceholderView()
                .tabItem {
                    Label("Check-in", systemImage: "heart.text.square.fill")
                }
                .tag(Tab.checkIn)

            // Notes Tab
            NotesPlaceholderView()
                .tabItem {
                    Label("Notes", systemImage: "note.text")
                }
                .tag(Tab.notes)

            // Growth Tab
            GrowthPlaceholderView()
                .tabItem {
                    Label("Growth", systemImage: "chart.line.uptrend.xyaxis")
                }
                .tag(Tab.growth)

            // Settings Tab
            SettingsPlaceholderView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape.fill")
                }
                .tag(Tab.settings)
        }
        .tint(.pink)
    }
}

enum Tab: String, CaseIterable {
    case dashboard
    case checkIn
    case notes
    case growth
    case settings

    var title: String {
        switch self {
        case .dashboard: return "Dashboard"
        case .checkIn: return "Check-in"
        case .notes: return "Notes"
        case .growth: return "Growth"
        case .settings: return "Settings"
        }
    }
}

// MARK: - Placeholder Views (Week 1)

struct DashboardPlaceholderView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "house.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.pink)

                Text("Dashboard")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Coming in Week 3")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .navigationTitle("Dashboard")
        }
    }
}

struct CheckInPlaceholderView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "heart.text.square.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.pink)

                Text("Check-in")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Coming in Week 3-4")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .navigationTitle("Check-in")
        }
    }
}

struct NotesPlaceholderView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "note.text")
                    .font(.system(size: 60))
                    .foregroundColor(.pink)

                Text("Notes")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Coming in Week 4")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .navigationTitle("Notes")
        }
    }
}

struct GrowthPlaceholderView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "chart.line.uptrend.xyaxis")
                    .font(.system(size: 60))
                    .foregroundColor(.pink)

                Text("Growth Gallery")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Coming in Week 5")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .navigationTitle("Growth")
        }
    }
}

struct SettingsPlaceholderView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Image(systemName: "gearshape.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.pink)

                Text("Settings")
                    .font(.title)
                    .fontWeight(.bold)

                Text("Coming in Week 7-8")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .navigationTitle("Settings")
        }
    }
}

#Preview {
    MainTabView()
}
