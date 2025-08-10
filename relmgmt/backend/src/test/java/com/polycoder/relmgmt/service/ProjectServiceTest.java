package com.polycoder.relmgmt.service;

import com.polycoder.relmgmt.dto.ProjectRequest;
import com.polycoder.relmgmt.dto.ProjectResponse;
import com.polycoder.relmgmt.entity.*;
import com.polycoder.relmgmt.exception.ResourceNotFoundException;
import com.polycoder.relmgmt.exception.ValidationException;
import com.polycoder.relmgmt.repository.ProjectRepository;
import com.polycoder.relmgmt.repository.ReleaseRepository;
import com.polycoder.relmgmt.service.impl.ProjectServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ReleaseRepository releaseRepository;

    @InjectMocks
    private ProjectServiceImpl projectService;

    private Release release;
    private Project project;
    private ProjectRequest request;

    @BeforeEach
    void setUp() {
        release = new Release();
        release.setId(10L);
        release.setName("Release");
        release.setIdentifier("2025-010");

        project = new Project();
        project.setId(1L);
        project.setName("P1");
        project.setType(ProjectTypeEnum.DAY_1);
        project.setRelease(release);

        request = new ProjectRequest();
        request.setName("P1");
        request.setDescription("Desc");
        request.setType(ProjectTypeEnum.DAY_1);

        // Common stubs for validation
        lenient().when(releaseRepository.existsById(10L)).thenReturn(true);
    }

    @Test
    void testFindByReleaseId() {
        when(projectRepository.findByReleaseId(10L)).thenReturn(Arrays.asList(project));
        List<ProjectResponse> list = projectService.findByReleaseId(10L);
        assertEquals(1, list.size());
        assertEquals("P1", list.get(0).getName());
    }

    @Test
    void testFindByReleaseIdPaged() {
        Pageable pageable = PageRequest.of(0, 10);
        when(projectRepository.findByReleaseId(10L, pageable))
                .thenReturn(new PageImpl<>(Arrays.asList(project), pageable, 1));
        Page<ProjectResponse> page = projectService.findByReleaseId(10L, pageable);
        assertEquals(1, page.getTotalElements());
    }

    @Test
    void testFindById() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        ProjectResponse resp = projectService.findById(1L);
        assertEquals("P1", resp.getName());
    }

    @Test
    void testFindByIdNotFound() {
        when(projectRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> projectService.findById(1L));
    }

    @Test
    void testCreate() {
        when(releaseRepository.findById(10L)).thenReturn(Optional.of(release));
        when(projectRepository.existsByReleaseIdAndName(10L, "P1")).thenReturn(false);
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        ProjectResponse resp = projectService.create(10L, request);
        assertEquals("P1", resp.getName());
        verify(projectRepository).save(any(Project.class));
    }

    @Test
    void testCreateDuplicateName() {
        when(releaseRepository.findById(10L)).thenReturn(Optional.of(release));
        when(projectRepository.existsByReleaseIdAndName(10L, "P1")).thenReturn(true);
        assertThrows(ValidationException.class, () -> projectService.create(10L, request));
    }

    @Test
    void testCreateReleaseNotFound() {
        when(releaseRepository.findById(10L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> projectService.create(10L, request));
    }

    @Test
    void testUpdate() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        // Change name to trigger duplicate-name check path
        request.setName("P2");
        when(projectRepository.existsByReleaseIdAndName(10L, "P2")).thenReturn(false);
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        ProjectResponse resp = projectService.update(1L, request);
        assertEquals("P2", resp.getName());
    }

    @Test
    void testUpdateNotFound() {
        when(projectRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> projectService.update(1L, request));
    }

    @Test
    void testDelete() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        // project has no scope items by default
        assertDoesNotThrow(() -> projectService.delete(1L));
        verify(projectRepository).delete(project);
    }

    @Test
    void testDeleteWithScopeItemsConflict() {
        ScopeItem s = new ScopeItem();
        s.setName("S1");
        s.setProject(project);
        project.addScopeItem(s);

        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        assertThrows(ValidationException.class, () -> projectService.delete(1L));
        verify(projectRepository, never()).delete(any());
    }
}


