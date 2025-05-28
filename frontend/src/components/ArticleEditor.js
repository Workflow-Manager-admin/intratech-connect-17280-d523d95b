import React, { useEffect, useState } from "react";
import styled from "styled-components";

const EditorContainer = styled.div`
  background: var(--kavia-dark);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 32px 22px 26px 22px;
  margin: 0 auto;
  max-width: 700px;
`;

const Input = styled.input`
  width: 100%;
  font-size: 1.2rem;
  background: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  margin-bottom: 16px;
  padding: 12px 7px;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 220px;
  font-size: 1.08rem;
  background: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  padding: 10px 7px;
  margin-bottom: 16px;
`;

const Button = styled.button`
  background-color: var(--kavia-orange);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 1.09rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 5px;
  &:hover {
    background-color: #FF8B4D;
  }
`;

const Select = styled.select`
  width: 100%;
  background: transparent;
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 5px;
  padding: 12px 7px;
  margin-bottom: 12px;
`;

export default function ArticleEditor({
  onSave,
  initialData = {},
  categories,
  tags,
}) {
  const [title, setTitle] = useState(initialData.title || "");
  const [content, setContent] = useState(initialData.content || "");
  const [selectedCategories, setSelectedCategories] = useState(initialData.categories || []);
  const [selectedTags, setSelectedTags] = useState(initialData.tags || []);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setError("");
    onSave({
      title: title.trim(),
      content: content.trim(),
      categories: selectedCategories,
      tags: selectedTags,
    });
  };

  return (
    <EditorContainer>
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={title}
          placeholder="Article title"
          onChange={e => setTitle(e.target.value)}
        />
        <TextArea
          value={content}
          placeholder="Write your article here..."
          onChange={e => setContent(e.target.value)}
        />
        <Select
          multiple
          value={selectedCategories}
          onChange={e =>
            setSelectedCategories(Array.from(e.target.selectedOptions, o => o.value))
          }
        >
          <option value="">Select categories</option>
          {categories.map(cat =>
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          )}
        </Select>
        <Select
          multiple
          value={selectedTags}
          onChange={e =>
            setSelectedTags(Array.from(e.target.selectedOptions, o => o.value))
          }
        >
          <option value="">Select tags</option>
          {tags.map(tag =>
            <option key={tag.id} value={tag.id}>{tag.name}</option>
          )}
        </Select>
        {error && <div style={{ color: "red", marginBottom: 9 }}>{error}</div>}
        <Button type="submit">
          Save Article
        </Button>
      </form>
    </EditorContainer>
  );
}
