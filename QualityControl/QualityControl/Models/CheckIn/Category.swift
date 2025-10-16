//
//  Category.swift
//  QualityControl
//
//  Created by Jeremy Watt on 10/15/25.
//

import Foundation
import SwiftData

@Model
final class Category {
    @Attribute(.unique) var id: UUID
    var name: String
    var categoryDescription: String
    var icon: String
    var colorHex: String
    var isDefault: Bool
    var prompts: [String]

    init(id: UUID = UUID(), name: String, description: String, icon: String) {
        self.id = id
        self.name = name
        self.categoryDescription = description
        self.icon = icon
        self.colorHex = "#EC4899" // Pink default
        self.isDefault = false
        self.prompts = []
    }
}
