from pathlib import Path

from docx import Document


DOCX = Path(r"E:\cxy\04-需求管理\PRD-OMS发货单拆单与合单功能-v1.0.docx")
START = "4.3 本期不包含"
END = "5. 优先级说明"


def delete_paragraph(paragraph):
    element = paragraph._element
    element.getparent().remove(element)
    paragraph._p = paragraph._element = None


def main():
    doc = Document(DOCX)
    paragraphs = list(doc.paragraphs)
    start_index = next((i for i, p in enumerate(paragraphs) if p.text.strip() == START), None)
    end_index = next((i for i, p in enumerate(paragraphs) if p.text.strip() == END), None)
    if start_index is None:
        raise SystemExit(f"Section not found: {START}")
    if end_index is None or end_index <= start_index:
        raise SystemExit(f"Following section not found: {END}")

    removed = [p.text.strip() for p in paragraphs[start_index:end_index]]
    for paragraph in paragraphs[start_index:end_index]:
        delete_paragraph(paragraph)

    doc.save(DOCX)
    print(f"Updated: {DOCX}")
    print(f"Removed paragraphs: {len(removed)}")
    for text in removed:
        print(f"  - {text}")


if __name__ == "__main__":
    main()
