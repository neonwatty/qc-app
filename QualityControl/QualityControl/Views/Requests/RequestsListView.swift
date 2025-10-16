//
//  RequestsListView.swift
//  QualityControl
//
//  Week 7: Requests System
//  Main view for managing relationship requests
//

import SwiftUI
import SwiftData

struct RequestsListView: View {

    // MARK: - Properties

    @Environment(\.modelContext) private var modelContext
    @State private var viewModel: RequestsViewModel
    @State private var showCreateRequest = false
    @State private var selectedRequest: RelationshipRequest?

    private let currentUserId: UUID

    // MARK: - Initialization

    init(currentUserId: UUID) {
        self.currentUserId = currentUserId
        _viewModel = State(initialValue: RequestsViewModel(
            modelContext: ModelContext(ModelContainer.shared),
            currentUserId: currentUserId
        ))
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: QCSpacing.xl) {
                    // Info banner
                    infoBanner

                    // Tab selector
                    tabSelector

                    // Requests list
                    if viewModel.isLoading {
                        ProgressView()
                            .padding()
                    } else if viewModel.displayedRequests.isEmpty {
                        emptyState
                    } else {
                        requestsList
                    }
                }
                .padding()
            }
            .background(QCColors.backgroundPrimary)
            .navigationTitle("Requests")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button(action: { showCreateRequest = true }) {
                        Label("New Request", systemImage: "plus")
                            .font(QCTypography.body)
                    }
                }
            }
            .sheet(isPresented: $showCreateRequest) {
                CreateRequestSheet(viewModel: viewModel, currentUserId: currentUserId)
            }
            .sheet(item: $selectedRequest) { request in
                RequestDetailView(
                    request: request,
                    viewModel: viewModel,
                    isReceived: viewModel.selectedTab == .received
                )
            }
            .task {
                await viewModel.loadRequests()
            }
            .refreshable {
                await viewModel.refresh()
            }
        }
    }

    // MARK: - Subviews

    private var infoBanner: some View {
        HStack(spacing: QCSpacing.md) {
            Image(systemName: "info.circle")
                .foregroundStyle(QCColors.info)

            VStack(alignment: .leading, spacing: QCSpacing.xs) {
                Text("Send and receive thoughtful requests with your partner. Requests help you coordinate activities, start conversations, and plan special moments.")
                    .font(QCTypography.body)
                    .foregroundStyle(QCColors.textSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .padding(QCSpacing.md)
        .background(QCColors.info.opacity(0.1))
        .cornerRadius(QCSpacing.md)
    }

    private var tabSelector: some View {
        HStack(spacing: QCSpacing.md) {
            ForEach(RequestTab.allCases, id: \.self) { tab in
                Button(action: { viewModel.selectedTab = tab }) {
                    HStack(spacing: QCSpacing.xs) {
                        Image(systemName: tab.icon)

                        Text(tab.rawValue)
                            .font(QCTypography.body)

                        // Badge count for pending
                        if tab == .received && viewModel.pendingReceivedCount > 0 {
                            Text("\(viewModel.pendingReceivedCount)")
                                .font(QCTypography.captionSmall)
                                .fontWeight(.semibold)
                                .padding(.horizontal, QCSpacing.xs)
                                .padding(.vertical, 2)
                                .background(QCColors.primary)
                                .foregroundStyle(.white)
                                .clipShape(Capsule())
                        }
                    }
                    .padding(.horizontal, QCSpacing.md)
                    .padding(.vertical, QCSpacing.sm)
                    .background(viewModel.selectedTab == tab ? QCColors.primary : Color.clear)
                    .foregroundStyle(viewModel.selectedTab == tab ? .white : QCColors.textPrimary)
                    .cornerRadius(QCSpacing.lg)
                }
            }

            Spacer()
        }
    }

    private var requestsList: some View {
        VStack(alignment: .leading, spacing: QCSpacing.md) {
            ForEach(viewModel.displayedRequests) { request in
                RequestCard(
                    request: request,
                    isReceived: viewModel.selectedTab == .received,
                    onTap: { selectedRequest = request }
                )
            }
        }
    }

    private var emptyState: some View {
        VStack(spacing: QCSpacing.md) {
            Image(systemName: viewModel.selectedTab == .received ? "tray" : "paperplane")
                .font(.system(size: 48))
                .foregroundStyle(QCColors.textSecondary)

            Text(viewModel.selectedTab == .received ? "No Received Requests" : "No Sent Requests")
                .font(QCTypography.heading2)
                .foregroundStyle(QCColors.textPrimary)

            Text(viewModel.selectedTab == .received
                ? "When your partner sends you a request, it will appear here."
                : "Requests you send to your partner will appear here.")
                .font(QCTypography.body)
                .foregroundStyle(QCColors.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, QCSpacing.xl)

            if viewModel.selectedTab == .sent {
                Button(action: { showCreateRequest = true }) {
                    Text("Create Request")
                        .font(QCTypography.body)
                        .foregroundStyle(.white)
                        .padding(.horizontal, QCSpacing.lg)
                        .padding(.vertical, QCSpacing.md)
                        .background(QCColors.primary)
                        .cornerRadius(QCSpacing.md)
                }
                .padding(.top, QCSpacing.md)
            }
        }
        .padding(.vertical, QCSpacing.xxl)
    }
}

// MARK: - Preview

#Preview {
    RequestsListView(currentUserId: UUID())
        .modelContainer(PreviewContainer.create())
}
